import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포 경로: https://<user>.github.io/picbook/
  base: '/picbook/',
})
