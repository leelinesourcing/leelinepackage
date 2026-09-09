import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://www.leelinepackage.com',
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.leelinepackage.com' },
    ],
  },
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [react()],
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
