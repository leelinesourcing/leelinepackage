# CLAUDE.md

Project context and workflow rules for Claude Code. Brand/color/type specifics live in
`docs/brand-guide.md` — this file is the workflow only.

## Project overview

**LeelinePackage** is a B2B custom-packaging manufacturer site (China → global brands). It is a
single marketing homepage (and a design-system inventory page) built with **Astro 7 + Tailwind
CSS v4 + React**, deployed as a static site on **Cloudflare Workers** (`@astrojs/cloudflare`).
The production page is `src/pages/index.astro` (self-contained, inline styles + scripts).

## Documentation

All brand, color, and typography decisions live in **`docs/brand-guide.md`** — read it before
making any design decision. Do not invent hex values, font names, or spacing; extract from there
or add to the token block first.

## File structure

- **Components:** `src/components/` — PascalCase `.astro` files (e.g. `Navbar.astro`)
- **Pages:** `src/pages/` — lowercase with hyphens (e.g. `design-system.astro`)
- **Styles & tokens:** `src/styles/global.css` (self-hosted font imports), `src/styles/theme.css`
  (the `@theme static` token block), `src/styles/base.css` (base layer).
- **Layout:** `src/layouts/Layout.astro` — page shell (head, fonts preload, footer).

## Component rules (IMPORTANT)

- Before building any new UI element, check `src/components/` and the design-system inventory at
  `src/pages/design-system.astro`.
- If a match exists: **import and reuse it** — never rebuild what already exists.
- If no match exists: build the component in `src/components/`, add it to the design-system page
  with its name and file path, **then** use it in the page you are building.
- The design-system page must always reflect every reusable component in `src/components/` — keep it updated.
- The homepage (`index.astro`) is currently a single self-contained file; only `Navbar.astro` is
  a reusable component today. Extract repeated UI into components before reusing it elsewhere.

## Styling rules

- All colors and fonts are defined as Tailwind tokens in `src/styles/theme.css` under `@theme static`
  (e.g. `forest`, `kraft`, `brass`, `ivory`, `clay`, `charcoal`, `moss`; `font-heading`, `font-body`).
- Prefer Tailwind utility classes made from those tokens. **Never** hard-code hex values or font
  names in components.
- To add a new color or font: add it to `@theme` first, then use the generated class.

## Image handling

Every content image is served from the **R2 bucket via the custom domain
`https://img.leelinepackage.com/<key>`** (each page defines `const R2 = 'https://img.leelinepackage.com'`).
There are no local content images in the repo — `src/assets/` is unused.

- Render every content image with a **plain `<img>`** whose `src` is the raw R2 URL, passing the
  intrinsic `width` and `height` plus `alt`, `loading`, and `decoding`:

  ```astro
  <img src={`${R2}/custom-bag/hero.webp`} alt="…" width={1200} height={800}
       loading="lazy" decoding="async" class="cb-img" />
  ```

- **Do NOT use Astro's `<Image>`** (`astro:assets`) for these. It rewrites the `src` to
  `/_image?href=<encoded>` in dev and copies the file into self-hosted `/_astro/*.webp` at build, so
  the raw R2 URL never reaches the HTML. The `<Image>` component, `image.remotePatterns` and the
  adapter's `imageService` have all been removed — do not reintroduce them for R2 imagery.
- Above-the-fold images (hero, header) use `loading="eager"`, `fetchpriority="high"`,
  `decoding="sync"`. All others use `loading="lazy"`, `decoding="async"`.
- Full-bleed hero/CTA backgrounds stay as CSS `url('https://img.leelinepackage.com/…')` with a
  gradient overlay — not an `<img>`.
- For third-party URLs you don't control: use a standard `<img>` with explicit `width` and `height`.
- `public/` is only for fixed-path system files: `favicon.ico`, `logo.svg`, `robots.txt`, OG images.
- Always include descriptive `alt` text on every image.

## Performance rules

- **Fonts** must be self-hosted via `@fontsource-variable` packages imported in
  `src/styles/global.css`. Never add Google Fonts `<link>` tags or `preconnect` hints.
- **`will-change`**: avoid unless fixing a measured animation-perf problem; never in base CSS, never
  on a selector matching many elements, never left on after an animation ends.
- **Below-fold sections:** use `content-visibility: auto` with `contain-intrinsic-size: auto 600px`
  only on heavy, self-contained sections starting below the fold. Never on headers, heroes, sticky
  elements, footer, anchor-link target sections, or sections whose JS needs layout measurements
  before they enter the viewport (e.g. carousels).
- **No render-blocking external resources:** no external `<link rel="stylesheet">` in the `<head>`.
  All CSS and fonts must be same-origin (bundled into `_astro/`).

## Visual work

When building or modifying any page, component, or visual element, read `docs/brand-guide.md`
first. Do not invent a look outside the established palette, type scale, and image treatment.

## Verify before done

After every set of code changes, run:

```
npm run lint
npm run build
```

and confirm both pass before reporting done.

> Do NOT run `npm run lint:fix`. The `eslint-plugin-astro` recommended config has a bug that
> deletes the homepage "Featured Work" section from `src/pages/index.astro`. Use `npm run lint`
> to check, and fix lint issues by hand. If `lint:fix` is ever run, `git restore src/pages/index.astro`.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Astro documentation

- Docs: https://docs.astro.build
- Routing: https://docs.astro.build/en/guides/routing/
- Components: https://docs.astro.build/en/basics/astro-components/
- Styling / Tailwind: https://docs.astro.build/en/guides/styling/
