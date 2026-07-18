import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ariad/contracts": path.resolve(__dirname, "packages/contracts/src/index.ts"),
      "@ariad/knowledge-core": path.resolve(
        __dirname,
        "packages/knowledge-core/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});

