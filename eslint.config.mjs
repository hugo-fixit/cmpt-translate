import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable TypeScript support
  typescript: true,

  // Global ignores
  ignores: [
    'assets/lib/**',
    'public/**',
    'node_modules/**',
  ],
})
