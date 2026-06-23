import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import gitignore from "eslint-config-flat-gitignore";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  gitignore({
    files: [".gitignore"],
  }),

  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat.recommended,

  {
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "simple-import-sort": pluginSimpleImportSort,
      "unused-imports": unusedImports,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // React 17+ JSX transform
      "react/react-in-jsx-scope": "off",

      // Don't require React import in JSX files
      "react/jsx-uses-react": "off",

      // Disable prop-types validation
      "react/prop-types": "off",

      // Disable strict rules for incomplete features
      "no-undef": "warn",
      "no-unreachable": "warn",
      "react/jsx-key": "warn",
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",

      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  pluginPrettierRecommended,
]);
