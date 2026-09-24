import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';

/*
  Every link on this site opens in a new tab — internal ones included. Doing that by hand across
  122 imported Markdown files would be unmaintainable, so it happens once here.

  `markdown.remarkPlugins` / `markdown.rehypePlugins` are NOT the hook anymore: Astro 7 renders
  Markdown with Sätteri (Rust), and those options now require installing `@astrojs/markdown-remark`,
  which swaps the processor back to unified and DROPS the heading ids the blog's 1,311 table-of-
  contents links point at. Sätteri takes hast plugins directly instead, and its own heading-id
  plugin is appended AFTER any user plugins, so heading slugs stay exactly as they are.

  In-page `#anchor` links are skipped — a table-of-contents jump must not open a second tab.
*/
const openLinksInNewTab = {
  name: 'open-links-in-new-tab',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = typeof node.properties?.href === 'string' ? node.properties.href : '';
      if (!href || href.startsWith('#')) return;
      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', 'noopener');
    },
  },
};

export default defineConfig({
  output: 'static',
  site: 'https://www.leelinepackage.com',
  adapter: cloudflare(),
  integrations: [react()],
  markdown: {
    processor: satteri({ hastPlugins: [openLinksInNewTab] }),
  },
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
