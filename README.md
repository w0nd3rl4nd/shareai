# ShareAI
A CLI tool to collect whitelisted project files and output them in a clean, AI-ready format. Ideal for code review, debugging, or sharing code snippets with context.

# Features
- Uses .aiwhitelist to specify files/folders
- Supports glob * for recursive inclusion
- Skips hidden files and node_modules
- Outputs formatted files to ShareAIOutput.txt
- [ROUTE] / [Code] format for easy copy-paste
- Written in TypeScript, easy to extend

# Installation
## Global
`pnpm add -g shareai` \
`npm install -g shareai` \
`yarn global add shareai`

## Local / Dev
`pnpm add -D shareai` \
`pnpm run ailister`

# Usage
1. **Create .aiwhitelist in your project root:** \
apps/backend/src/* \
apps/web/src/* \
apps/backend/prisma/schema.prisma \
apps/api/prisma/seed.ts 

> To include an entire folder use * \
> To include specific files, write their relative path

2. **Run:** \
`pnpm shareai`
\
Output written to: *ShareAIOutput.txt* \
Output Format:\
```
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

License
MIT © w0nd3rl4nd