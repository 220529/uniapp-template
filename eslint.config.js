// eslint.config.js
import vue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  ...vue.configs['flat/strongly-recommended'],
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    languageOptions: {
      globals: {
        uni: 'readonly',
        getCurrentPages: 'readonly',
        browser: 'readonly',
        node: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'eqeqeq': ['error', 'always'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'arrow-parens': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'max-len': ['warn', { code: 120 }],
      'space-before-function-paren': 'off',
      'comma-dangle': 'off',
      'indent': 'off',
    },
  },
];
