# ShareAI

A CLI tool to collect whitelisted project files and output them in a 
clean, AI-ready format. Ideal for code review, debugging, or sharing code 
snippets with context.

## Features

- **Default behavior**: Uses `.gitignore` as a blacklist (i.e., excludes 
ignored files by default)
- **Override with `.aiignore`**: Optionally specify files/folders to 
exclude **only from ShareAI** using `.aiignore`
- **Supports glob `*`** for recursive inclusion
- **Skips hidden files and `node_modules`** by default
- **Outputs formatted files** to `ShareAIOutput.txt`
- **[ROUTE] / [Code] format** for easy copy-paste
- Written in TypeScript, easy to extend

## Installation

### Global

```bash
pnpm add -g shareai
npm install -g shareai
yarn global add shareai
```

### Local / Dev

```bash
pnpm add -D shareai
pnpm shareai
```

## Usage

1. **Create `.aiignore` in your project root (optional)**  
   This file works like `.gitignore`, but only affects ShareAI's behavior. 
 
   Example:
   ```
   apps/backend/tsconfig.json
   ```

2. **Run:**

   ```bash
   pnpm shareai
   ```

   Output written to: `ShareAIOutput.txt`  
   Output Format:

   ```text
   [PROJECT NAME]: name-of-the-parent-folder
   [QUANTITY OF FILES]: number
   [ROUTE]: relative/path/to/file
   [Code]:
   <file content>
   [eof]

   [ROUTE]: relative/path/to/file
   [Code]:
   <file content>
   [eof]
   ...
   ```

## License

MIT © w0nd3rl4nd