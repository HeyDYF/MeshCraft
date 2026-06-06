import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.indexOf("node_modules/three") !== -1 ||
            id.indexOf("@react-three") !== -1
          ) {
            return "three-stack";
          }

          if (id.indexOf("node_modules/lucide-react") !== -1) {
            return "icons";
          }
        },
      },
    },
  },
});
