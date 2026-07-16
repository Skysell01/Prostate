import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.webhook': JSON.stringify(process.env.webhook || process.env.WEBHOOK || '')
  }
});
