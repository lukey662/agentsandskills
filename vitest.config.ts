import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      // The CLI entrypoint is contract-tested through subprocesses in tests/cli.test.ts.
      exclude: ["src/cli/index.ts", "src/cli/output.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        // Branch coverage stays lower on the slim install CLI until optional paths gain tests.
        branches: 55
      },
      reporter: ["text", "lcov"]
    }
  }
});
