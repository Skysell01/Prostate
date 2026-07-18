import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' loads all env variables regardless of prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env.webhook': JSON.stringify(env.webhook || env.WEBHOOK || ''),
      'process.env.CRM_URL': JSON.stringify(env.CRM_URL || ''),
      'process.env.CRM_CHANNEL_ID': JSON.stringify(env.CRM_CHANNEL_ID || ''),
      'process.env.CRM_PRODUCT_ID': JSON.stringify(env.CRM_PRODUCT_ID || ''),
      'process.env.CRM_TOKEN': JSON.stringify(env.CRM_TOKEN || '')
    }
  };
});
