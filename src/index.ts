#!/usr/bin/env node

import fs from "fs";
import path from "path";
import clipboard from "clipboardy";

const ROOT = process.cwd();
const GITIGNORE_FILE = path.join(ROOT, ".gitignore");
const AIIGNORE_FILE = path.join(ROOT, ".aiignore");
const OUTPUT_FILE = path.join(ROOT, "ShareAIOutput.txt");

// Read .gitignore or fallback to empty array
const gitignorePatterns: string[] = fs.existsSync(GITIGNORE_FILE)
  ? fs.readFileSync(GITIGNORE_FILE, "utf8")
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"))
  : [];

// Read .aiignore if exists
const aiignorePatterns: string[] = fs.existsSync(AIIGNORE_FILE)
  ? fs.readFileSync(AIIGNORE_FILE, "utf8")
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"))
  : [];

// Combine ignore patterns
const ignorePatterns = [...gitignorePatterns, ...aiignorePatterns];

// Always ignore ShareAIOutput.txt
ignorePatterns.push("ShareAIOutput.txt");

function shouldIgnore(filePath: string): boolean {
  const relativePath = path.relative(ROOT, filePath);
  
  // Always ignore .gitignore and .aiignore files themselves
  if (relativePath === ".gitignore" || relativePath === ".aiignore") {
    return true;
  }
  
  return ignorePatterns.some(pattern => {
    if (pattern.endsWith("/")) {
      return relativePath.startsWith(pattern);
    }
    return relativePath.includes(pattern) || relativePath === pattern;
  });
}

function getAllFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(full));
    } else {
      if (!shouldIgnore(full)) {
        files.push(full);
      }
    }
  }

  return files;
}

const filesToInclude = getAllFiles(ROOT);

// Add project name and quantity of files at the beginning
const projectName = path.basename(ROOT);
const fileCount = filesToInclude.length;
let output = `[PROJECT NAME]: ${projectName}\n[QUANTITY OF FILES]: ${fileCount}\n\n`;

for (const f of filesToInclude) {
  const rel = path.relative(ROOT, f);
  const code = fs.readFileSync(f, "utf8");
  output += `[ROUTE]: ${rel}\n[Code]:\n${code.trim()}\n[eof]\n\n`;
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, output.trim(), "utf8");
console.log(`✅ Output written to ${OUTPUT_FILE}`);

clipboard.writeSync(output.trim());
console.log("📋 Output copied to clipboard!");