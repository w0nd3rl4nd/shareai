#!/usr/bin/env node

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const WHITELIST_FILE = path.join(ROOT, ".aiwhitelist");
const OUTPUT_FILE = path.join(ROOT, "ShareAIOutput.txt");

if (!fs.existsSync(WHITELIST_FILE)) {
  console.error("❌ No .aiwhitelist file found in current directory.");
  console.error("Please generate a '.aiwhitelist' file in your execution directory");
  process.exit(1);
}

const whitelist: string[] = fs
  .readFileSync(WHITELIST_FILE, "utf8")
  .split("\n")
  .map(l => l.trim())
  .filter(l => l && !l.startsWith("#"));

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(full));
    } else {
      files.push(full);
    }
  }

  return files;
}

let filesToInclude: string[] = [];

for (const entry of whitelist) {
  const isGlob = entry.endsWith("/*");
  const basePath = isGlob ? entry.slice(0, -2) : entry;
  const full = path.join(ROOT, basePath);

  if (!fs.existsSync(full)) {
    console.warn("⚠️ Skipped (not found):", entry);
    continue;
  }

  const stat = fs.statSync(full);

  if (stat.isDirectory()) {
    // if glob, include all files recursively
    if (isGlob) {
      filesToInclude.push(...getAllFiles(full));
    } else {
      filesToInclude.push(...getAllFiles(full));
    }
  } else {
    filesToInclude.push(full);
  }
}

// remove duplicates
filesToInclude = [...new Set(filesToInclude)];

let output = "";
for (const f of filesToInclude) {
  const rel = path.relative(ROOT, f);
  const code = fs.readFileSync(f, "utf8");
  output += `[ROUTE]: ${rel}\n[Code]:\n${code.trim()}\n[eof]\n\n`;
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, output.trim(), "utf8");
console.log(`✅ Output written to ${OUTPUT_FILE}`);
