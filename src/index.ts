#!/usr/bin/env node

import fs from "fs";
import path from "path";
import clipboard from "clipboardy";

const ROOT = process.cwd();
const GITIGNORE_FILE = path.join(ROOT, ".gitignore");
const AIIGNORE_FILE = path.join(ROOT, ".aiignore");
const OUTPUT_FILE = path.join(ROOT, "ShareAIOutput.txt");

// Default ignore patterns for non-code files
const DEFAULT_IGNORE_PATTERNS = [
  "*.ico",
  "*.jpg",
  "*.jpeg",
  "*.png",
  "*.gif",
  "*.bmp",
  "*.svg",
  "*.webp",
  "*.webm",
  "*.mp4",
  "*.avi",
  "*.mov",
  "*.mp3",
  "*.wav",
  "*.flac",
  "*.ogg",
  "*.pdf",
  "*.doc",
  "*.docx",
  "*.xls",
  "*.xlsx",
  "*.ppt",
  "*.pptx",
  "*.zip",
  "*.rar",
  "*.7z",
  "*.tar",
  "*.gz",
  "*.db",
  "*.sql",
  "*.sqlite",
  "*.sqlite3",
  "*.lock",
  "node_modules/**",
  "dist/**",
  "build/**",
  "*.log",
  ".DS_Store",
  ".git/**",
  ".svn/**",
  ".hg/**",
  ".vscode/**",
  ".idea/**",
  "*.tmp",
  "*.temp"
];

// Read .gitignore or fallback to empty array
const gitignorePatterns: string[] = fs.existsSync(GITIGNORE_FILE)
  ? fs.readFileSync(GITIGNORE_FILE, "utf8")
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"))
  : [];

// Read .aiignore if exists, or create default one
let aiignorePatterns: string[] = [];
if (fs.existsSync(AIIGNORE_FILE)) {
  const existingContent = fs.readFileSync(AIIGNORE_FILE, "utf8");
  const existingLines = existingContent
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
  
  // Preserve existing content first, then add common types
  const updatedContent = [
    ...existingLines,
    "", // Empty line separator
    ...DEFAULT_IGNORE_PATTERNS
  ];
  
  // Write updated content back to file (existing content first, then common types)
  fs.writeFileSync(AIIGNORE_FILE, updatedContent.join("\n"));
  console.log(`✅ Updated .aiignore file with existing patterns followed by common types`);
} else {
  // Create .aiignore with default patterns only
  fs.writeFileSync(AIIGNORE_FILE, DEFAULT_IGNORE_PATTERNS.join("\n"));
  console.log(`✅ Created default .aiignore file with common non-code file patterns`);
}

// Combine ignore patterns
const ignorePatterns: string[] = [...gitignorePatterns, ...DEFAULT_IGNORE_PATTERNS];

// Always ignore ShareAIOutput.txt
ignorePatterns.push("ShareAIOutput.txt");

function shouldIgnore(filePath: string): boolean {
  const relativePath = path.relative(ROOT, filePath);
  
  // Always ignore .gitignore and .aiignore files themselves
  if (relativePath === ".gitignore" || relativePath === ".aiignore") {
    return true;
  }
  
  // Handle different pattern types
  for (const pattern of ignorePatterns) {
    // Handle directory patterns like "node_modules/**"
    if (pattern.endsWith("**")) {
      const basePattern = pattern.slice(0, -2); // Remove the "**"
      if (relativePath.startsWith(basePattern)) {
        return true;
      }
    }
    // Handle directory patterns ending with "/"
    else if (pattern.endsWith("/")) {
      if (relativePath.startsWith(pattern)) {
        return true;
      }
    }
    // Handle wildcard patterns like "*.db"
    else if (pattern.includes("*")) {
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(relativePath)) {
        return true;
      }
    }
    // Handle exact matches
    else {
      if (relativePath === pattern) {
        return true;
      }
    }
  }
  
  return false;
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

// Add project name and file count at the beginning
const projectName = path.basename(ROOT);
const fileCount = filesToInclude.length;
let output = `[PROJECT]: ${projectName}\n[FILE COUNT]: ${fileCount}\n\n`;

for (const f of filesToInclude) {
  const rel = path.relative(ROOT, f);
  try {
    const content = fs.readFileSync(f, "utf8");
    output += `[FILE]: ${rel}\n[CONTENT]:\n${content}\n[END FILE]\n\n`;
  } catch (error) {
    // Skip files that can't be read (like binary files)
    console.warn(`⚠️  Skipping unreadable file: ${rel}`);
  }
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, output.trim(), "utf8");
console.log(`✅ Output written to ${OUTPUT_FILE}`);

clipboard.writeSync(output.trim());
console.log("📋 Output copied to clipboard!");
