const eslintPluginPrettier = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
