module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    'standard',
    'plugin:vue/vue3-recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    'html',
    'vue',
    '@typescript-eslint',
  ],
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.mjs'] },
    },
  },
  rules: {
    // import
    'import/order': 'error',
    'import/first': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unresolved': 'off',
    'import/no-absolute-path': 'off',

    // Common
    semi: [2, 'never'],
    curly: [2, 'multi-or-nest', 'consistent'],
    quotes: ['error', 'single'],
    'no-param-reassign': 'off',
    'array-bracket-spacing': ['error', 'never'],
    'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
    'block-spacing': ['error', 'always'],
    camelcase: 'off',
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-constant-condition': 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-cond-assign': ['error', 'always'],
    'func-call-spacing': ['off', 'never'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    indent: [
      'error',
      2,
      { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 },
    ],
    'no-restricted-syntax': [
      'error',
      'DebuggerStatement',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'no-spaced-func': 'error',
    'object-curly-spacing': ['error', 'always'],
    'no-return-await': 'off',
    'space-before-function-paren': ['error', 'never'],

    // es6
    'no-var': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: true,
      },
    ],
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: false,
        allowUnboundThis: true,
      },
    ],
    'object-shorthand': [
      'error',
      'always',
      {
        ignoreConstructors: false,
        avoidQuotes: true,
      },
    ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'generator-star-spacing': 'off',

    // best-practice
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'off',
    complexity: ['off', 11],
    eqeqeq: ['error', 'allow-null'],
    'no-alert': 'warn',
    'no-case-declarations': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-with': 'error',
    'no-void': 'error',
    'no-useless-escape': 'error',
    'vars-on-top': 'error',
    'require-await': 'off',
    'no-return-assign': 'off',
    'operator-linebreak': [2, 'before'],

    // TS
    'no-useless-constructor': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
    '@typescript-eslint/type-annotation-spacing': ['error', {}],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [2, { args: 'none', ignoreRestSiblings: true }],
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'error',

    // off
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',

    'vue/max-attributes-per-line': ['warn', { singleline: 5 }],
    'vue/require-explicit-emits': 'off',
  },
}
