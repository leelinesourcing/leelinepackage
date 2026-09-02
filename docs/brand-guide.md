# LeelinePackage — Brand Guide

> The single source of truth for the LeelinePackage design system. Every value below is
> extracted directly from the production homepage (`src/pages/index.astro`), the Tailwind
> token block (`src/styles/theme.css`), and the direction decisions agreed in this session.
> Do not invent values — if you need a token not listed here, add it to `@theme` first.

Brand direction: **The Material Atelier** (direction 3). Premium, tactile, editorial
B2B packaging design.

---

## 1. Brand overview

**What this is:** The homepage for **LeelinePackage**, a custom packaging manufacturer
in China (Wuhan) serving brands, retailers and DTC businesses — custom boxes, mailers,
rigid gift boxes, folding cartons, pouches, paper bags, labels and more.

**Who it's for:** Procurement leads, founders and brand/product managers at B2B companies
choosing a packaging supplier. They care about unit cost, MOQ, lead time, print quality,
material choice and proof.

**Personality & mood:** Assured, not hype-y. *Protect & Impress* — engineering-led but
craft-led. Feels like a premium materials atelier: calm, tactile, editorial, with quiet
brass/gold detail on deep forest green. It should read as confident and knowledgeable —
"the partner who has done this a thousand times" — never flashy or generic.

---

## 2. Color tokens

Defined in `src/styles/theme.css` under `@theme static`. Each token maps to a Tailwind
utility (e.g. `--color-forest` → `bg-forest`, `text-forest`, `border-forest`).

| Token | Hex | Tailwind class | When to use |
|-------|-----|----------------|-------------|
| `forest` | `#1F3B2C` | `bg-forest`, `text-forest`, `border-forest` | Primary brand green. Dark section backgrounds (hero-of-marketing moments, inverted CTAs), primary buttons, brand elements. |
| `kraft` | `#C9A87C` | `bg-kraft`, `text-kraft` | Warm brass-tan accent. Secondary highlight, eyebrow text, soft accents on dark surfaces. |
| `brass` | `#B08D4C` | `bg-brass`, `text-brass` | Gold accent. Primary CTA buttons ("Get a Free Quote"), eyebrow labels, numeric markers, hover states. |
| `ivory` | `#F5F0E5` | `bg-ivory`, `text-ivory` | Light background / text-on-dark. Page background base, text on dark sections. |
| `clay` | `#EDE5D4` | `bg-clay`, `text-clay` | Surface tone. Tactile band backgrounds (stats band, customize grid), cards on ivory. |
| `charcoal` | `#21241C` | `bg-charcoal`, `text-charcoal` | Body & heading text on light surfaces. |
| `moss` | `#8C8676` | `bg-moss`, `text-moss` | Muted/secondary text, captions, supporting copy. |

**Derived / legacy named values used in the homepage (declared in `index.astro` `:root`):**

| Var | Hex | Role |
|-----|-----|------|
| `--forest-deep` | `#14261B` | Darker forest for hover states, deep overlays, footer bg. |
| `--brass-soft` | `#C9A87C` | Light brass for hero `<em>` italics and light-CTAs (same value as `kraft`). |
| `--ivory` | `#F5F0E5` | Same as `ivory` token. |
| `--kraft` | `#EDE5D4` | Same as `clay` token. |

Color usage rules:
- Dark sections (hero, inline CTA, final CTA, about, footer) default to `forest` / `forest-deep` with `ivory` text.
- Light sections default to `ivory` bg with `charcoal` / `moss` text.
- Brass is the **only** saturated accent — use it sparingly (one CTA, eyebrow, numerals), never for large fill areas.
- Avoid pure black/white; always lean to the tinted tones above.

---

## 3. Typography

**Fonts (self-hosted via `@fontsource-variable` in `src/styles/global.css`):**

| Role | Family | Fallback | Weights |
|------|--------|----------|---------|
| Heading | `Newsreader Variable` | `Georgia, serif` | 500, 600 |
| Body | `Instrument Sans Variable` | `system-ui, sans-serif` | 400, 600 |

- Serif (Newsreader) = editorial, craft, premium. Use for headings, brand lockup, emphasis.
- Sans (Instrument Sans) = clean, engineering, utilitarian. Use for body, UI, buttons, labels.

**Size scale (rem, from the homepage clamp() values).** All are responsive clamps; the
max value is the desktop cap.

| Level | Size | Line height | Weight | Letter-spacing | Notes |
|-------|------|-------------|--------|----------------|-------|
| Hero H1 | `clamp(2.7rem, 6.6vw, 5.6rem)` | `0.97` | 500 | `-0.03em` | `max-width: 22ch`, `text-wrap: balance`; italic `<em>` in `brass-soft`. |
| Section title | `clamp(2rem, 5vw, 3.6rem)` | `1.04` | 500 | `-0.02em` | Centered variant `clamp(2.2rem, 5.2vw, 4rem)`. |
| CTA title | `clamp(2.4rem, 6vw, 4.6rem)` | `1` | 500 | `-0.02em` | Inverted sections. |
| Card H3 | `1.2–1.45rem` | `~1.3` | 600 | `-0.01em` | Product `1.45`, industry/process `1.4`, edge/customize `1.2–1.28`. |
| FAQ question | `clamp(1.05rem, 1.8vw, 1.25rem)` | — | 600 | — | Heading serif. |
| Eyebrow (label) | `0.72rem` | — | 600 | `0.3em` (uppercase) | Body sans, uppercase, always `brass`. |
| Button | `0.95rem` | — | 600 | `0.01em` | Body sans. `.btn-sm` = `0.88rem`. |
| Section sub | `1.06rem` | `1.7` | 400 | — | `max-width: 46ch`, `moss`. |
| Hero sub | `clamp(1.04rem, 1.7vw, 1.22rem)` | `1.7` | 400 | — | `max-width: 58ch`, `ivory` 0.82. |
| Body text | `0.95–0.98rem` | `1.6–1.7` | 400 | — | Card/process body. |
| Testimonial quote | `1.16rem` | `1.8` | 400 (italic) | — | Heading serif italic. |
| Caption / small | `0.78–0.92rem` | `1.25–1.6` | 500–600 | varied | Scene captions `0.92`, process meta `0.8` uppercase `0.12em`. |

**Usage rules:**
- Headings always use the serif heading font. Never set a heading in the body font.
- Body and UI (buttons, labels, form text) always use the body sans.
- Eyebrows are uppercase body-sans at `0.72rem`, `letter-spacing: 0.3em`, `brass` — the smallest, quietest label; use above each section title.
- Emphasis (serif italic, `brass-soft`) is reserved for 1–2 words per headline, never whole sentences.

---

## 4. Spacing and layout

- **Max content width:** `.wrap { width: min(1200px, 100% - clamp(2rem, 6vw, 6rem)); margin-inline: auto; }`
- **Section vertical padding:** `clamp(4rem, 9vw, 8rem) 0` (most sections); `clamp(4rem, 9vw, 7rem)` for edge/patent; `clamp(4.5rem, 10vw, 9rem)` for the big inverted CTA; `clamp(3.5rem, 8vw, 6rem)` for inline CTA and footer top.
- **Section heading block:** `margin-bottom: clamp(2.5rem, 6vw, 5rem)`; centered heads `clamp(3rem, 7vw, 5.5rem)`.
- **Within a heading block:** title `margin-top: 1.1rem`; sub `margin-top: 1.2rem`.
- **Centered heading max width:** `66rem` (keeps long titles to one line on desktop).
- **Grid gaps:** `clamp(1.2rem, 2.5vw, 1.6rem)` (customize), `1.1rem` (scenes), `1.6rem` (edge), `1rem` (stats).
- **Breakpoints:** `900px` (collapse grids/nav), `640px` (mobile single column), `1025px` (larger hero bg), `641px` (mobile hero bg).
- Buttons/full-width actions use `border-radius: 999px`; media cards use `1.1–1.4rem`; visual containers use generous rounding.

Rhythm principle: generous, calm whitespace. Sections alternate tone (light `ivory` ↔ dark `forest`) so each section reads as a deliberate "moment". Distinguish sections with background, not borders.

---

## 5. Visual tone

- **Tactile & material-first.** The brand is about the material, not just the print. Images and copy should emphasize texture (foil, flute, emboss).
- **Editorial, magazine-calm.** Large serif headlines, wide whitespace, quiet brass detail. Not loud, not cluttered.
- **Inverted "moments."** Deep forest sections break up the light page and create premium contrast (hero, CTAs, footer).
- **Gold as punctuation, not paint.** Brass appears on tiny accents (eyebrows, numerals, one CTA), never as a big fill.
- **Confident, unhurried.** Copy is assured and specific ("MOQ from 500", "7-day turnaround", "Pantone match"), never promotional fluff.

---

## 6. Do's and don'ts

Captured from the session's design feedback:

- **Don't** open multiple paragraphs with "As a…". Keep that construction to at most once on the page (prefer zero).
- **Don't** open the hero with the brand name — lead with the customer benefit. Weave the keyword ("custom packaging manufacturer") in naturally mid-sentence.
- **Don't** repeat a claim already shown elsewhere on the page (e.g. `MOQ 500` already in the stats band → don't repeat it in the hero; only **one** "24 hours" across the whole page).
- **One primary CTA per section** — a single button, not a cluster.
- **Buttons** use a right-arrow icon, not a leaf. Not "Ready to…", not "elevating your brand value" boilerplate.
- **Headings:** never leave a single word broken alone onto a second line. Use `text-wrap: balance` on titles; keep key section titles to one line on desktop by widening heading/title width rather than shrinking type.
- **Testimonials:** exactly 2 customers, 3 full paragraphs each, real first+last names (not generic "Sarah"/"David"), include role/position, country (not Vietnam), industry, and concrete numbers. Don't open with "LeelinePackage".
- **Certificates:** show real certificates without a white "card" behind them; key images are autocropped to remove white edges.
- **Hero:** background image + centered text, a single star-rating pill at the top, no spec strip.
- Keep the overall palette preset — only adjust brightness, never swap the hues.

---

## 7. Image treatment

Style the *images*, wherever they are hosted. (Storage/hosting is handled separately.)

- **Aspect ratio:** product cards `1/1`; industry, customize, scenes, edge cards `4/3`. Use `object-fit: cover`.
- **Corner radius:** product `1.3rem`; industry `1.4rem`; scene/edge `1.1rem`; circular elements (pager dots, arrows) `999px`/`50%`.
- **Hero:** full-bleed background image + radial overlay gradient `linear`-style darkening — `radial-gradient(120% 70% at 50% 0%, rgba(20,38,27,.42) 0%, rgba(20,38,27,.72) 55%, rgba(20,38,27,.9) 100%)` — plus a subtle grain overlay and a slowly drifting brass leaf seal.
- **Caption overlays (industry & scene cards):** bottom gradient `linear-gradient(180deg, transparent 42%, rgba(20,38,27,.55))`; scene figcaptions use `linear-gradient(180deg, transparent, rgba(20,38,27,.75))`.
- **Brand logo wall:** images `filter: grayscale(0.45); opacity: 0.92`; on hover `grayscale(0); opacity: 1`. Object-fit contain, max-height varies by breakpoint.
- **Certificate images:** fixed `height: 300px` (210px mobile), `width: auto`, `object-fit: contain`, no drop-shadow/background card.
- **Edge cards:** numbered ivory circular badge (`.edge-dot`, `44px`) at top-left.
- **Shadows:** soft, green-tinted — e.g. card hover `0 24px 50px -30px rgba(31,59,44,.5)`; buttons `0 14px 30px -12px rgba(31,59,44,.55)`; never hard/sharp shadows.
- **Ambient texture:** an SVG-turbulence grain overlay (`mix-blend-mode: multiply`, `opacity: 0.05`), and backdrop blur on floating controls (`backdrop-filter: blur(6–14px)`).
- **Entrance:** reveal-on-scroll (fade + `translateY(36px)`, optional `scale`/`left`/`right`/`blur`/`clip`), reset to `opacity:1; transform:none` when `.in`.
- **Controls:** circular arrows use a translucent dark fill over imagery (rgba(20,38,27,.5)) with `border: 1px solid rgba(245,240,229,.55)`.

---

*Generated from `src/pages/index.astro` and `src/styles/theme.css` — direction 3, The Material
Atelier. If a value here and the code differ, the code wins; update this guide afterward.*
