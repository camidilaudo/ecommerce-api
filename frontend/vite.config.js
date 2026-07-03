import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy para que las cookies funcionen en same-origin durante desarrollo.
    // El frontend llama a /api/... y Vite lo redirige a http://localhost:8081.
    // Esto evita problemas de cross-origin con cookies HttpOnly (SameSite=Lax).
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
