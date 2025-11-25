import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      // alias thư mục src như thường lệ (nếu muốn dùng @)
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // alias trỏ ra thư mục shared ở root monorepo
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
});
