import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import gitignore from "eslint-config-flat-gitignore";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginReact from "eslint-plugin-react";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default defineConfig([
  gitignore({
    files: [".gitignore"],
  }),

  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
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
  pluginReact.configs.flat.recommended,

  {
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "simple-import-sort": pluginSimpleImportSort,
      "unused-imports": unusedImports,
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

      "unused-imports/no-unused-imports": "error",
    },
  },

  pluginPrettierRecommended,
]);
