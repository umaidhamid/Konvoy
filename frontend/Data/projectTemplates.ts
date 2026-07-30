import { Braces, Container, FileCode2, GitBranch, Settings2, Sparkles } from "lucide-react";

export interface TemplateFile {
  name: string;
  content: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Sparkles;
  files: TemplateFile[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "env-starter",
    name: "Environment Variables",
    description: "A .env starter with the example file teams usually keep alongside it.",
    icon: Settings2,
    files: [
      {
        name: ".env",
        content: `NODE_ENV=development
PORT=3000
DATABASE_URL=
JWT_SECRET=
`,
      },
      {
        name: ".env.example",
        content: `# Copy to .env and fill in real values - this file is safe to commit
NODE_ENV=development
PORT=3000
DATABASE_URL=
JWT_SECRET=
`,
      },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    description: "Dockerfile, compose file, and ignore rules for a containerized service.",
    icon: Container,
    files: [
      {
        name: "Dockerfile",
        content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`,
      },
      {
        name: "docker-compose.yml",
        content: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
`,
      },
      {
        name: ".dockerignore",
        content: `node_modules
.env
.git
npm-debug.log
`,
      },
    ],
  },
  {
    id: "lint-format",
    name: "ESLint + Prettier",
    description: "Baseline lint and formatting config for a JS/TS project.",
    icon: Braces,
    files: [
      {
        name: ".eslintrc.json",
        content: `{
  "root": true,
  "extends": ["eslint:recommended"],
  "env": { "node": true, "es2022": true },
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" }
}
`,
      },
      {
        name: ".prettierrc",
        content: `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
`,
      },
      {
        name: ".editorconfig",
        content: `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`,
      },
    ],
  },
  {
    id: "github-ci",
    name: "GitHub Actions CI",
    description: "A starter workflow for install/test/build on every push.",
    icon: GitBranch,
    files: [
      {
        name: "ci.yml",
        content: `# Save locally as .github/workflows/ci.yml - Konvoy stores this file flat,
# so move it into that folder after you pull it.
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build --if-present
`,
      },
    ],
  },
  {
    id: "typescript",
    name: "TypeScript Config",
    description: "A sensible tsconfig.json plus a matching .env starter.",
    icon: FileCode2,
    files: [
      {
        name: "tsconfig.json",
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
`,
      },
      {
        name: ".env",
        content: `NODE_ENV=development
`,
      },
    ],
  },
  {
    id: "nextjs",
    name: "Next.js App Config",
    description: "next.config.js and the local env file a fresh Next.js app needs.",
    icon: Sparkles,
    files: [
      {
        name: "next.config.js",
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,
      },
      {
        name: ".env.local.example",
        content: `NEXT_PUBLIC_API_URL=http://localhost:4000
`,
      },
    ],
  },
];
