import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://smart-attendence-f4rb.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://smart-attendence-f4rb.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
