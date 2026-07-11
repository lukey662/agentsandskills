import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  target: "node20",
  external: ["@napi-rs/keyring"]
});
