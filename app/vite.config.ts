import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev: proxy /api to the Denario Control Room backend (uvicorn :8000).
// Prod: set VITE_API_BASE to the deployed API origin instead.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
