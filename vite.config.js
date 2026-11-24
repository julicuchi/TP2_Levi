import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import diaHandler from './api/dia.js';

// En Vercel, /api/dia es una función serverless. En desarrollo la sirve Vite con el mismo código.
const diaApi = {
  name: 'dia-api',
  configureServer(server) {
    server.middlewares.use('/api/dia', (req, res) => { diaHandler(req, res); });
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/dia', (req, res) => { diaHandler(req, res); });
  },
};

export default defineConfig({ plugins: [react(), diaApi] });
