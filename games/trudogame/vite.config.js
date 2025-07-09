import { defineConfig } from 'vite'

export default defineConfig({
  base: '/games/trudogame/', // ← Change to match your actual deployment path
  build: {
    outDir: 'dist'
  }
})