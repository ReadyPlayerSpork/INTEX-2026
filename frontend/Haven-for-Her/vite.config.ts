import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'

// mkcert must not run during `vite build`: in Docker/CI it can hang (CA install prompt),
// hit permission errors under /.vite-plugin-mkcert, or fail without a network.
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(command === 'serve' ? [mkcert()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7229',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
