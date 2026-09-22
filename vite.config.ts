import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pages 및 로컬 상대 경로 호환
  server: {
    port: 3000,
    open: true
  }
});
