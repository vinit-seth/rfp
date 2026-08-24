import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Polyfill process.env so existing CRA code doesn't crash:
  define: {
    'process.env': {}
  },
  // Bonus: Automatically open the browser on npm start
  server: {
    open: true,
    port: 5173
  }
})