import fs from "fs";
import path from "path";
import type { KBChunk } from "./chunker";
import { generateEmbedding, generateEmbeddings, cosineSimilarity } from "./embeddings";

export interface SearchResult {
  chunk: KBChunk;
  score: number;
}

interface StoredIndex {
  version: number;
  createdAt: string;
  chunks: KBChunk[];
}

const INDEX_VERSION = 1;

function getIndexPath(): string {
  return path.join(process.cwd(), "data", "kb-index.json");
}

class VectorStore {
  private chunks: KBChunk[] = [];
  private loaded = false;

  private static instance: VectorStore | null = null;

  static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    const indexPath = getIndexPath();
    if (fs.existsSync(indexPath)) {
      try {
        const raw = fs.readFileSync(indexPath, "utf-8");
        const data: StoredIndex = JSON.parse(raw);
        if (data.version === INDEX_VERSION && data.chunks?.length > 0) {
          this.chunks = data.chunks;
          this.loaded = true;
          console.log(
            `[VectorStore] Loaded ${this.chunks.length} chunks from index`
          );
          return;
        }
      } catch {
        console.warn("[VectorStore] Failed to load index, will rebuild");
      }
    }
    this.loaded = true;
  }

  async addChunks(chunks: KBChunk[]): Promise<void> {
    const textsToEmbed = chunks
      .filter((c) => !c.embedding)
      .map((c) => c.content);

    if (textsToEmbed.length > 0) {
      console.log(
        `[VectorStore] Generating embeddings for ${textsToEmbed.length} chunks...`
      );
      const embeddings = await generateEmbeddings(textsToEmbed);
      let embIdx = 0;
      for (const chunk of chunks) {
        if (!chunk.embedding) {
          chunk.embedding = embeddings[embIdx++];
        }
      }
    }

    this.chunks = chunks;
    this.loaded = true;
  }

  async search(
    query: string,
    options?: { topK?: number; category?: string; tags?: string[] }
  ): Promise<SearchResult[]> {
    await this.load();
    if (this.chunks.length === 0) return [];

    const topK = options?.topK ?? 5;
    const queryEmbedding = await generateEmbedding(query);

    let candidates = this.chunks;
    if (options?.category) {
      candidates = candidates.filter(
        (c) => c.category === options.category
      );
    }
    if (options?.tags?.length) {
      candidates = candidates.filter((c) =>
        options.tags!.some((t) => c.tags.includes(t))
      );
    }

    const scored: SearchResult[] = candidates
      .filter((c) => c.embedding)
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }

  async keywordSearch(
    query: string,
    options?: { topK?: number; category?: string }
  ): Promise<SearchResult[]> {
    await this.load();
    if (this.chunks.length === 0) return [];

    const topK = options?.topK ?? 5;
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower
      .split(/[\s,;.!?]+/)
      .filter((t) => t.length > 1);

    let candidates = this.chunks;
    if (options?.category) {
      candidates = candidates.filter(
        (c) => c.category === options.category
      );
    }

    const scored: SearchResult[] = candidates
      .map((chunk) => {
        const contentLower = chunk.content.toLowerCase();
        const tagStr = chunk.tags.join(" ").toLowerCase();
        let score = 0;

        for (const term of queryTerms) {
          const contentMatches = (
            contentLower.match(new RegExp(escapeRegex(term), "g")) || []
          ).length;
          score += contentMatches * 2;

          if (tagStr.includes(term)) score += 5;
          if (chunk.section.toLowerCase().includes(term)) score += 3;
        }

        return { chunk, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }

  async hybridSearch(
    query: string,
    options?: { topK?: number; category?: string }
  ): Promise<SearchResult[]> {
    const hasEmbeddings = this.chunks.some((c) => c.embedding);

    if (!hasEmbeddings) {
      return this.keywordSearch(query, options);
    }

    const [vectorResults, keywordResults] = await Promise.all([
      this.search(query, { ...options, topK: (options?.topK ?? 5) * 2 }),
      this.keywordSearch(query, {
        ...options,
        topK: (options?.topK ?? 5) * 2,
      }),
    ]);

    const merged = new Map<string, SearchResult>();
    const topK = options?.topK ?? 5;

    for (const r of vectorResults) {
      const existing = merged.get(r.chunk.id);
      if (!existing || r.score > existing.score) {
        merged.set(r.chunk.id, { chunk: r.chunk, score: r.score * 0.7 });
      }
    }

    const maxKeyword = Math.max(...keywordResults.map((r) => r.score), 1);
    for (const r of keywordResults) {
      const normalizedScore = r.score / maxKeyword;
      const existing = merged.get(r.chunk.id);
      if (existing) {
        existing.score += normalizedScore * 0.3;
      } else {
        merged.set(r.chunk.id, {
          chunk: r.chunk,
          score: normalizedScore * 0.3,
        });
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  persist(): void {
    const indexPath = getIndexPath();
    const dir = path.dirname(indexPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data: StoredIndex = {
      version: INDEX_VERSION,
      createdAt: new Date().toISOString(),
      chunks: this.chunks,
    };

    fs.writeFileSync(indexPath, JSON.stringify(data));
    console.log(
      `[VectorStore] Persisted ${this.chunks.length} chunks to ${indexPath}`
    );
  }

  getChunkCount(): number {
    return this.chunks.length;
  }

  isReady(): boolean {
    return this.loaded && this.chunks.length > 0;
  }

  getStats(): {
    totalChunks: number;
    categories: Record<string, number>;
    hasEmbeddings: boolean;
  } {
    const categories: Record<string, number> = {};
    for (const c of this.chunks) {
      categories[c.category] = (categories[c.category] || 0) + 1;
    }
    return {
      totalChunks: this.chunks.length,
      categories,
      hasEmbeddings: this.chunks.some((c) => c.embedding),
    };
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { VectorStore };
export default VectorStore;
