import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ariad/contracts": path.resolve(__dirname, "packages/contracts/src/index.ts"),
      "@ariad/knowledge-core/canonical": path.resolve(
        __dirname,
        "packages/knowledge-core/src/canonical.ts",
      ),
      "@ariad/knowledge-core/node": path.resolve(
        __dirname,
        "packages/knowledge-core/src/node.ts",
      ),
      "@ariad/knowledge-core": path.resolve(
        __dirname,
        "packages/knowledge-core/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
