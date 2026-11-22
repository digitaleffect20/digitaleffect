import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  const envFilePath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envFilePath)) {
    try {
      const parsedEnv = dotenv.parse(fs.readFileSync(envFilePath, 'utf-8'));
      if (
        (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_URL.startsWith('https://')) &&
        parsedEnv.VITE_SUPABASE_URL?.startsWith('https://')
      ) {
        process.env.VITE_SUPABASE_URL = parsedEnv.VITE_SUPABASE_URL;
      }
      if (
        (!process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY.length < 30) &&
        parsedEnv.VITE_SUPABASE_ANON_KEY &&
        parsedEnv.VITE_SUPABASE_ANON_KEY.length >= 30
      ) {
        process.env.VITE_SUPABASE_ANON_KEY = parsedEnv.VITE_SUPABASE_ANON_KEY;
      }
    } catch {}
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
