#!/usr/bin/env node

/**
 * Knowledge Base Indexing Script
 * Usage: node scripts/index-knowledge-base.js
 *
 * Reads all markdown files from src/knowledge-base/,
 * chunks them, generates embeddings, and persists the index.
 */

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const KB_BASE = path.join(process.cwd(), "src", "knowledge-base");
const INDEX_PATH = path.join(process.cwd(), "data", "kb-index.json");
const INDEX_VERSION = 1;

const EMBEDDING_ENDPOINT =
  process.env.QWEN_EMBEDDING_ENDPOINT ||
  (process.env.QWEN_ENDPOINT
    ? process.env.QWEN_ENDPOINT.replace("/chat/completions", "/embeddings")
    : "https://api-inference.bitdeer.ai/v1/embeddings");

const EMBEDDING_MODEL =
  process.env.QWEN_EMBEDDING_MODEL || "BAAI/bge-m3";
const API_KEY = process.env.QWEN_API_KEY;

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: normalized };
  const yamlBlock = match[1];
  const content = match[2].trim();
  const meta = {};

  for (const line of yamlBlock.split("\n")) {
    const kvMatch = line.match(/^(\w+):\s*(.+)$/);
    if (!kvMatch) continue;
    const [, key, value] = kvMatch;
    if (key === "category") meta.category = value.trim().replace(/^["']|["']$/g, "");
    else if (key === "tags") {
      const tagMatch = value.match(/\[(.+)\]/);
      if (tagMatch) meta.tags = tagMatch[1].split(",").map((t) => t.trim());
    } else if (key === "lastUpdated") {
      meta.lastUpdated = value.trim().replace(/^["']|["']$/g, "");
    }
  }
  return { meta, content };
}

function scanMdFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...scanMdFiles(fullPath));
    else if (entry.name.endsWith(".md")) files.push(fullPath);
  }
  return files;
}

function splitByHeadings(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let heading = "";
  let buf = [];
  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+)$/);
    if (m) {
      if (buf.length) {
        const text = buf.join("\n").trim();
        if (text) sections.push({ heading, content: text });
      }
      heading = m[1];
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (buf.length) {
    const text = buf.join("\n").trim();
    if (text) sections.push({ heading, content: text });
  }
  return sections;
}

function chunkDocument(doc) {
  const sections = splitByHeadings(doc.content);
  const chunks = [];
  for (const section of sections) {
    if (section.content.length < 20) continue;
    const chunkId = `${doc.id}::${section.heading}`
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff:]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    chunks.push({
      id: chunkId,
      content: section.heading
        ? `## ${section.heading}\n\n${section.content}`
        : section.content,
      source: doc.id,
      section: section.heading || doc.filename,
      category: doc.category,
      tags: doc.tags,
    });
  }
  return chunks;
}

async function fetchEmbeddings(texts) {
  const BATCH_SIZE = 16;
  const all = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    process.stdout.write(`  Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}...`);

    const res = await fetch(EMBEDDING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const sorted = data.data.sort((a, b) => a.index - b.index);
    all.push(...sorted.map((item) => item.embedding));
    console.log(" done");
  }
  return all;
}

async function main() {
  console.log("=== Knowledge Base Indexer ===\n");

  const mdFiles = [...scanMdFiles(path.join(KB_BASE, "documents")), ...scanMdFiles(path.join(KB_BASE, "motorcycle-market"))];
  console.log(`Found ${mdFiles.length} markdown files\n`);

  const docs = mdFiles.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { meta, content } = parseFrontmatter(raw);
    const filename = path.basename(filePath, ".md");
    const relativePath = path.relative(KB_BASE, filePath);
    return {
      id: relativePath.replace(/\\/g, "/").replace(/\.md$/, ""),
      filename,
      category: meta.category || "general",
      tags: meta.tags || [],
      lastUpdated: meta.lastUpdated || "unknown",
      content,
    };
  });

  const allChunks = docs.flatMap(chunkDocument);
  console.log(`Created ${allChunks.length} chunks from ${docs.length} documents\n`);

  if (API_KEY) {
    console.log("Generating embeddings...");
    try {
      const texts = allChunks.map((c) => c.content);
      const embeddings = await fetchEmbeddings(texts);
      allChunks.forEach((chunk, i) => {
        chunk.embedding = embeddings[i];
      });
      console.log(`\nEmbeddings generated for all ${allChunks.length} chunks\n`);
    } catch (err) {
      console.warn(`\nEmbedding generation failed: ${err.message}`);
      console.log("Index will use keyword-only search\n");
    }
  } else {
    console.log("No QWEN_API_KEY found - index will use keyword-only search\n");
  }

  const dataDir = path.dirname(INDEX_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const indexData = {
    version: INDEX_VERSION,
    createdAt: new Date().toISOString(),
    chunks: allChunks,
  };

  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData));
  const sizeMB = (fs.statSync(INDEX_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`Index saved to ${INDEX_PATH} (${sizeMB} MB)`);
  console.log(`Total chunks: ${allChunks.length}`);
  console.log(`Has embeddings: ${allChunks.some((c) => c.embedding)}`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
