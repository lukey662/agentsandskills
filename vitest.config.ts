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
      // Quarantined OS modules (studio, audit, research) are not on the default CLI.
      // The CLI entrypoint is contract-tested through subprocesses in tests/cli.test.ts.
      exclude: [
        "src/cli/index.ts",
        "src/cli/output.ts",
        "src/config/contracts.ts",
        "src/install/audit.ts",
        "src/install/audit-v2.ts",
        "src/install/audit-rules/**",
        "src/install/assistant-adapters-table.ts",
        "src/install/diff.ts",
        "src/research/**",
        "src/studio/**"
      ],
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
