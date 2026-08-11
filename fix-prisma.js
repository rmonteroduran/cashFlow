const fs = require('fs');

const files = [
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\login\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\layout.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\api\\auth\\[...nextauth]\\route.ts",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\pipeline\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\layout.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\clients\\actions.ts",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\job-openings\\actions.ts",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\candidates\\new\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\candidates\\[id]\\edit\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\candidates\\actions.ts",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\client-portal\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\client-portal\\vacantes\\[id]\\page.tsx",
  "C:\\Users\\rmontero\\.gemini\\antigravity-ide\\scratch\\recruit\\src\\app\\(dashboard)\\admin\\branding\\actions.ts"
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Replace instantiation with import
  content = content.replace(/const prisma = new PrismaClient\(\);?/g, 'import { prisma } from "@/lib/prisma";');
  // Remove standalone import
  content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+['"]@prisma\/client['"];?\n?/g, '');
  // Remove PrismaClient from destructured imports
  content = content.replace(/PrismaClient\s*,\s*/g, '');
  content = content.replace(/,\s*PrismaClient/g, '');
  
  fs.writeFileSync(f, content);
  console.log(`Fixed ${f}`);
});
