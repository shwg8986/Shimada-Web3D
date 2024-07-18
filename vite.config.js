import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  // server: {
  //   host: true,
  // },
  server: {
    port: 3000, // 開発環境用のポート
    host: "0.0.0.0",
  },
  preview: {
    port: 5000, // build後preview環境用のポート
    host: "0.0.0.0",
  },
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
