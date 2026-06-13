import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  astro: true,
  unocss: true,
  ignores: ['src/content/**'],
  rules: {
    'e18e/prefer-static-regex': 'off',
    'no-restricted-syntax': ['error', {
      selector: 'CallExpression[callee.type="Identifier"][callee.name="oklch"] > CallExpression[callee.type="Identifier"][callee.name="var"]',
      message: 'Do not use oklch(var(...)). Use var(...) directly or color-mix() instead.',
    }],
  },
})
