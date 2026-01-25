import { defineConfig } from "vite";
import typecomposer from "typecomposer-plugin";
import path from "path";

export default defineConfig({
  plugins: [typecomposer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
