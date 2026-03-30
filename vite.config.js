import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function copyRuntimeDirectories(directories) {
  return {
    name: "copy-runtime-directories",
    closeBundle() {
      const outDir = resolve(__dirname, "dist");
      directories.forEach((directory) => {
        const sourceDir = resolve(__dirname, directory);
        const targetDir = resolve(outDir, directory);
        if (!existsSync(sourceDir)) {
          return;
        }
        mkdirSync(outDir, { recursive: true });
        cpSync(sourceDir, targetDir, { recursive: true, force: true });
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8000,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8000,
    strictPort: true,
  },
  build: {
    outDir: "dist",
  },
  plugins: [
    copyRuntimeDirectories(["assets", "data"]),
  ],
});
