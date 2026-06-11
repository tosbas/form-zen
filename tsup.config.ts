import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs", "iife"],
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0"
    }
  },
  globalName: "FormZen",
  clean: true,
  sourcemap: true,
  target: "es2020",
  tsconfig: "./tsconfig.json"
});