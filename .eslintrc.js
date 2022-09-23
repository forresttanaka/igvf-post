module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  globals: {
    __dirname: true,
    Buffer: true,
  },
  rules: {
    "no-unused-vars": "warn",
  },
};
