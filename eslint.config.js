import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "e2e/**",
      "playwright-report/**",
      "test-results/**",
      "*.config.js",
      "*.config.cjs",
      "*.config.mjs",
      "eslint.config.js",
    ],
  },

  js.configs.recommended,

  {
    files: ["src/**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // React
      ...react.configs.recommended.rules,

      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // React 17+/18+/19 JSX Transform
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Optional modern React settings
      "react/display-name": "off",
      "react/prop-types": "off",

      // Vite Fast Refresh
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      // Disable ESLint's built-in rule in favor of unused-imports
      "no-unused-vars": "off",

      // Auto-remove unused imports
      "unused-imports/no-unused-imports": "error",

      // Warn about unused variables
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Console policy
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
    },
  },
];
