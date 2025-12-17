import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Đảm bảo file _redirects được copy vào build
  build: {
    outDir: 'dist', // Output folder
    emptyOutDir: true, // Xóa folder cũ trước khi build
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173, // Khác port với server để tránh conflict
    host: true
  }
})