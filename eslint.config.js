import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      "**/dist/",
      "node_modules/",
      "coverage/",
      "release-artifacts/",
      ".agent-kit/",
      "research/workdir/",
      "examples/",
      "src/studio/**/assets/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "eslint.config.js",
            "tsup.config.ts",
            "vitest.config.ts",
            "packages/runtime/tsup.config.ts",
            "scripts/*.mjs",
            "scripts/lib/*.mjs"
          ]
        },
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // The CLI parses untyped JSON from user projects; narrow assertions are reviewed case by case.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowBoolean: true }],
      "no-console": "off"
    }
  },
  {
    files: ["src/studio/setup-form.ts", "src/studio/setup-server.ts"],
    rules: {
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off"
    }
  },
  {
    files: ["scripts/**/*.mjs", "*.config.js", "tsup.config.ts", "vitest.config.ts"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: globals.node
    }
  },
  prettier
);
