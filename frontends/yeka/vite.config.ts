// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/", //antes '/yeka/'
  build: {
    outDir: '../dist/yeka',
    emptyOutDir: true
  },
  plugins: [react()],
});
