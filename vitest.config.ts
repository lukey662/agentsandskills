import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: [
      "tests/studio-serve.test.ts",
      "tests/office.test.ts",
      "tests/studio.test.ts",
      "tests/wizard.test.ts",
      "tests/session-checkpoint.test.ts",
      "tests/audit.test.ts",
      "tests/setup-server-api.test.ts",
      "tests/research.test.ts",
      "tests/runtime-provider.test.ts",
      "tests/runtime-workflow.test.ts",
      "tests/runtime-security.test.ts",
      "tests/agentic-level.test.ts",
      "tests/assistant-adapters-table.test.ts",
      "tests/diff.test.ts"
    ],
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      // The research subsystem shells out to git/GitHub and is smoke-covered separately.
      // The CLI entrypoint is contract-tested through subprocesses in tests/cli.test.ts,
      // which the in-process v8 provider cannot attribute.
      exclude: ["src/research/discover.ts", "src/research/scan.ts", "src/cli/index.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 65
      },
      reporter: ["text", "lcov"]
    }
  }
});
