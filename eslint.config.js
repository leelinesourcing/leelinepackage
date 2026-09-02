import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/',
      'dist-verify/',
      '.astro/',
      '.wrangler/',
      'node_modules/',
      '_images/',
      '_v/',
      'images/',
      'public/',
      'docs/',
    ],
  },
  // Astro `.astro` files (frontmatter + inline `<script>`)
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{js,astro}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];
