"use strict";

module.exports = {
  parser: "@typescript-eslint/parser",
  settings: {
    "import/extensions": [".js"],
    "import/resolver": {
      typescript: {},
      node: {
        extensions: [".js", ".json", ".ts"],
      },
    },
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    experimentalObjectRestSpread: true,
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  extends: ["@boxed/eslint-config-style-guide/nodejs", "prettier"],
  globals: {
    NodeJS: true,
  },
  plugins: ["@typescript-eslint"],
  overrides: [],
  rules: {},
  root: true,
};
