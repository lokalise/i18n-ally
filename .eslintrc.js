module.exports = {
  root: true,
  extends: '@antfu/eslint-config-vue',
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-useless-escape': 'off',
    'no-cond-assign': 'off',
    'no-unused-expressions': 'off',
  },
  env: {
    jest: true,
  },
}
