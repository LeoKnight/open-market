import fs from "fs";
import path from "path";

export interface KBDocument {
  id: string;
  filename: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  content: string;
  rawContent: string;
}

interface Frontmatter {
  category?: string;
  tags?: string[];
  lastUpdated?: string;
}

function parseFrontmatter(raw: string): {
  meta: Frontmatter;
  content: string;
} {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: normalized };

  const yamlBlock = match[1];
  const content = match[2].trim();
  const meta: Frontmatter = {};

  for (const line of yamlBlock.split("\n")) {
    const kvMatch = line.match(/^(\w+):\s*(.+)$/);
    if (!kvMatch) continue;
    const [, key, value] = kvMatch;
    if (key === "category") {
      meta.category = value.trim().replace(/^["']|["']$/g, "");
    } else if (key === "tags") {
      const tagMatch = value.match(/\[(.+)\]/);
      if (tagMatch) {
        meta.tags = tagMatch[1].split(",").map((t) => t.trim());
      }
    } else if (key === "lastUpdated") {
      meta.lastUpdated = value.trim().replace(/^["']|["']$/g, "");
    }
  }

  return { meta, content };
}

function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath));
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

export function getKBBasePath(): string {
  return path.join(process.cwd(), "src", "knowledge-base");
}

export function loadAllDocuments(): KBDocument[] {
  const basePath = getKBBasePath();
  const mdFiles = [
    ...scanDirectory(path.join(basePath, "documents")),
    ...scanDirectory(path.join(basePath, "motorcycle-market")),
  ];

  return mdFiles.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { meta, content } = parseFrontmatter(raw);
    const filename = path.basename(filePath, ".md");
    const relativePath = path.relative(basePath, filePath);

    return {
      id: relativePath.replace(/\\/g, "/").replace(/\.md$/, ""),
      filename,
      category: meta.category || "general",
      tags: meta.tags || [],
      lastUpdated: meta.lastUpdated || "unknown",
      content,
      rawContent: raw,
    };
  });
}

export function loadDocument(docId: string): KBDocument | null {
  const basePath = getKBBasePath();
  const filePath = path.join(basePath, `${docId}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta, content } = parseFrontmatter(raw);

  return {
    id: docId,
    filename: path.basename(filePath, ".md"),
    category: meta.category || "general",
    tags: meta.tags || [],
    lastUpdated: meta.lastUpdated || "unknown",
    content,
    rawContent: raw,
  };
}
