/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "./build/stats.html",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../build/client",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("@tanstack/react-query") ||
              id.includes("@tanstack/react-query-persist-client")
            ) {
              return "query-vendor";
            }
            if (id.includes("motion") || id.includes("lucide-react")) {
              return "ui-vendor";
            }
            if (id.includes("react-markdown") || id.includes("remark-gfm")) {
              return "markdown-vendor";
            }
            if (id.includes("luxon")) {
              return "date-vendor";
            }
            if (
              id.includes("/node_modules/react/") ||
              id.includes("/node_modules/react-dom/") ||
              id.includes("/node_modules/react-router-dom/") ||
              id.includes("/node_modules/react-router/")
            ) {
              return "react-vendor";
            }
          }

          if (id.includes("/src/backgrounds/")) {
            return "backgrounds";
          }

          if (id.includes("/src/pages/debug/") || id.includes("/src/pages/admin/")) {
            return "ops-pages";
          }

          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  base: "/app/",
  optimizeDeps: {
    include: ["@tanstack/react-virtual"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
