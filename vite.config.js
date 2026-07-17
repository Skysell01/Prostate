import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' loads all env variables regardless of prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env.webhook': JSON.stringify(env.webhook || env.WEBHOOK || '')
    }
  };
});
