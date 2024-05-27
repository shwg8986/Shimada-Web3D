import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [topLevelAwait()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 警告サイズを大きくする場合
  },
});
