import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Required for GitHub Pages deployment
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    // Remove proxy since data is served from public directory
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    sourcemap: true, // Enable sourcemaps for easier debugging
  },
  publicDir: 'public', // Ensure public directory is used for static assets
})
