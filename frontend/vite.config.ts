import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 8080, strictPort: true, host: true, proxy: { "/api": "http://localhost:3001", "/v1": "http://localhost:3001", "/health": "http://localhost:3001", "/metrics": "http://localhost:3001" } },
});
