const EMBEDDING_ENDPOINT =
  process.env.QWEN_EMBEDDING_ENDPOINT ||
  (process.env.QWEN_ENDPOINT
    ? process.env.QWEN_ENDPOINT.replace("/chat/completions", "/embeddings")
    : "https://api-inference.bitdeer.ai/v1/embeddings");

const EMBEDDING_MODEL =
  process.env.QWEN_EMBEDDING_MODEL || "BAAI/bge-m3";

const API_KEY = process.env.QWEN_API_KEY!;

export interface EmbeddingResult {
  embedding: number[];
  index: number;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const results = await generateEmbeddings([text]);
  return results[0];
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const BATCH_SIZE = 16;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await fetchEmbeddingBatch(batch);
    allEmbeddings.push(...batchEmbeddings);
  }

  return allEmbeddings;
}

async function fetchEmbeddingBatch(texts: string[]): Promise<number[][]> {
  const response = await fetch(EMBEDDING_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Embedding API error:", response.status, errText);
    throw new Error(`Embedding API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const sorted = (data.data as EmbeddingResult[]).sort(
    (a, b) => a.index - b.index
  );
  return sorted.map((item) => item.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
