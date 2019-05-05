module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended'
  ],
  // add your custom rules here
  rules: {
    'semi': [2, 'never'],
    'curly': [2, 'multi-or-nest', 'consistent'],
    'quotes': ['error', 'single'],
    'no-unused-vars': 'warn',
    'no-param-reassign': 'off',
    'indent': ['error', 2, { 'VariableDeclarator': 2, 'ArrayExpression': 1 }],
    'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': ['error', 'always'],
    'camelcase': 'off',
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-console': 'warn',
    'no-constant-condition': 'warn',
    'no-debugger': 'error',
    'no-cond-assign': ['error', 'always'],
    'func-call-spacing': ['off', 'never'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'indent': ['error', 2, { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 }],
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

    // es6
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-var': 'error',
    'prefer-const': ['error', {
      destructuring: 'any',
      ignoreReadBeforeAssign: true,
    }],
    'prefer-arrow-callback': ['error', {
      allowNamedFunctions: false,
      allowUnboundThis: true,
    }],
    'object-shorthand': ['error', 'always', {
      ignoreConstructors: false,
      avoidQuotes: true,
    }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',

    // best-practice
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    'consistent-return': 'off',
    'complexity': ['off', 11],
    'eqeqeq': ['error', 'allow-null'],
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

    // TS
    '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
    '@typescript-eslint/type-annotation-spacing': ['error', {}],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // vue-i18n
    'no-cond-assign': 'off',
  }
}
