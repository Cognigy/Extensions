const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.js"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2017,
        sourceType: "module"
      },
      globals: {
        ...globals.browser,
        ...globals.node
      },
    },
    rules: {
      "prefer-arrow-callback": ["error", { "allowNamedFunctions": true, "allowUnboundThis": true }],
      "func-style": ["error", "declaration", { "allowArrowFunctions": true }],
      "no-var": "error",
      "spaced-comment": ["error", "always"],
      "no-redeclare": "error",
      "no-eval": "off",
      "no-trailing-spaces": "error",
      "brace-style": ["error", "1tbs", { "allowSingleLine": false }],
      "keyword-spacing": ["error", {
        "before": true,
        "after": true,
        "overrides": {
          "catch": { "after": true },
          "finally": { "after": true },
          "else": { "after": true }
        }
      }],
      "space-before-blocks": "error",
      "semi": ["error", "always"],
      "eqeqeq": ["error", "always", { "null": "ignore" }],
      "no-mixed-spaces-and-tabs": "error",
      "space-before-function-paren": ["error", {
        "anonymous": "never",
        "named": "never",
        "asyncArrow": "always"
      }],
      "space-infix-ops": "error",
      "comma-spacing": ["error", { "before": false, "after": true }],
      "camelcase": ["error", { "properties": "always" }],
      "prefer-const": "error",
      "eol-last": ["error", "always"]
    }
  },
  {
    ignores: ["node_modules/", "build/", "vscode/"]
  }
];