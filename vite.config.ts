import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfig_paths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfig_paths()
  ],
  define: {
    'process.env': {

    },
    'process': {

    }
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true
      }
    }
  },
  build: {
    outDir: 'build/public'
  }
});
