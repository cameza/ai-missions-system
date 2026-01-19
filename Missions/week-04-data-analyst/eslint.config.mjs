import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore problematic legacy files for now
    "src/hooks/__tests__/use-summary-query.test.ts",
  ]),
  {
    rules: {
      // Temporarily disable explicit-any rule for legacy code
      "@typescript-eslint/no-explicit-any": "off",
      // Temporarily disable unused-vars for legacy code
      "@typescript-eslint/no-unused-vars": "off",
      // Disable react-hooks incompatible-library for demo pages
      "react-hooks/incompatible-library": "off",
      // Disable require imports for API routes
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
