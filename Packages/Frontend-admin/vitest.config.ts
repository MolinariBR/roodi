import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: true,
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "app"),
      "@core": path.resolve(__dirname, "src/Core"),
      "@modules": path.resolve(__dirname, "src/Modules"),
    },
  },
});
