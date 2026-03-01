import type { KBDocument } from "@/knowledge-base";

export interface KBChunk {
  id: string;
  content: string;
  source: string;
  section: string;
  category: string;
  tags: string[];
  embedding?: number[];
}

interface SplitSection {
  heading: string;
  content: string;
}

function splitByHeadings(markdown: string): SplitSection[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections: SplitSection[] = [];
  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      if (currentContent.length > 0) {
        const text = currentContent.join("\n").trim();
        if (text) {
          sections.push({ heading: currentHeading, content: text });
        }
      }
      currentHeading = headingMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    const text = currentContent.join("\n").trim();
    if (text) {
      sections.push({ heading: currentHeading, content: text });
    }
  }

  return sections;
}

const MAX_CHUNK_CHARS = 1500;
const OVERLAP_CHARS = 200;

function splitLargeSection(section: SplitSection): SplitSection[] {
  if (section.content.length <= MAX_CHUNK_CHARS) return [section];

  const parts: SplitSection[] = [];
  const paragraphs = section.content.split(/\n\n+/);
  let current = "";
  let partIndex = 0;

  for (const para of paragraphs) {
    if (current.length + para.length > MAX_CHUNK_CHARS && current.length > 0) {
      parts.push({
        heading: `${section.heading} (${partIndex + 1})`,
        content: current.trim(),
      });
      const overlap = current.slice(-OVERLAP_CHARS);
      current = overlap + "\n\n" + para;
      partIndex++;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }

  if (current.trim()) {
    parts.push({
      heading:
        parts.length > 0
          ? `${section.heading} (${partIndex + 1})`
          : section.heading,
      content: current.trim(),
    });
  }

  return parts;
}

export function chunkDocument(doc: KBDocument): KBChunk[] {
  const sections = splitByHeadings(doc.content);
  const chunks: KBChunk[] = [];

  for (const section of sections) {
    const subSections = splitLargeSection(section);
    for (const sub of subSections) {
      if (sub.content.length < 20) continue;

      const chunkId = `${doc.id}::${sub.heading}`
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff:]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      chunks.push({
        id: chunkId,
        content: sub.heading
          ? `## ${sub.heading}\n\n${sub.content}`
          : sub.content,
        source: doc.id,
        section: sub.heading || doc.filename,
        category: doc.category,
        tags: doc.tags,
      });
    }
  }

  return chunks;
}

export function chunkAllDocuments(docs: KBDocument[]): KBChunk[] {
  return docs.flatMap(chunkDocument);
}
