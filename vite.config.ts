import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://dmlwjd85.github.io/picbook/
export default defineConfig({
  plugins: [react()],
  base: '/picbook/',
})
