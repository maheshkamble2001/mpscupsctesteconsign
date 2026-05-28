import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr"; 

import path from "path";

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    open: true,
    host:true,	 
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      app: path.resolve(__dirname, "src/app"),
      components: path.resolve(__dirname, "src/components"),
      assets: path.resolve(__dirname, "src/assets"),
      configs: path.resolve(__dirname, "src/configs"),
      constants: path.resolve(__dirname, "src/constants"),
      hooks: path.resolve(__dirname, "src/hooks"),
      i18n: path.resolve(__dirname, "src/i18n"),
      middleware: path.resolve(__dirname, "src/middleware"),
      styles: path.resolve(__dirname, "src/styles"),
      utils: path.resolve(__dirname, "src/utils"),
      api: path.resolve(__dirname, "src/api"),
      context: path.resolve(__dirname, "src/context"),
    },
  },
});
