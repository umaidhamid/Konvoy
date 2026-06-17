export const INITIAL_FILES = {
"next.config.js": `module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['assets.konvoy.app']
  }
};`,

".env": `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/konvoy"
JWT_SECRET="konvoy_dev_secret"
NEXT_PUBLIC_API_URL="http://localhost:5000"
PORT=5000`,

"docker.yml": `version: '3.8'

services:
postgres:
image: postgres:16
restart: always
environment:
POSTGRES_DB: konvoy
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
ports:
- "5432:5432"`,

"package.json": `{
  "name": "konvoy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "axios": "^1.8.0"
  }
}`,


};
