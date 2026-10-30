import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror the `@/*` alias from tsconfig.json so tests can import the
    // same paths as the app does.
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
  },
});
