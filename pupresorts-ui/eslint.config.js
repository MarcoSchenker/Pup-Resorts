import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["node_modules"],
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },

  ...tseslint.configs.recommended,

  pluginReact.configs.flat.recommended,

  {
    settings: { react: { version: "detect" } },
  },

  {
    plugins: {
      react: pluginReact,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      // limpieza de líneas en blanco
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 1 }],
      curly: ["error", "multi-line"],
      "no-useless-return": "warn",

      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      "react/self-closing-comp": "warn",
      "react/jsx-no-useless-fragment": "warn",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // eliminar imports no usados
      "unused-imports/no-unused-imports": "error",
    },
  },
]);
