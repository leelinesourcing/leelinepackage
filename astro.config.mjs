import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-f65f4d4fa9664133a4ceca1f5d43e24d.r2.dev' },
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
