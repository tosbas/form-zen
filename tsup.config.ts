import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: {
      compilerOptions: {
        ignoreDeprecations: "6.0",
      }
    },
    clean: true,
    splitting: false,
  },
  {
    entry: ["src/cdn.ts"],
    format: ["iife"],
    globalName: "FormZenCDN",
    outDir: "dist",
  }
]);