/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base so the build works on GitHub Pages project sites
  // (chintanonweb.github.io/lazarus/), Vercel root, and local preview alike.
  base: "./",
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/test/**/*.test.ts"],
  },
});
