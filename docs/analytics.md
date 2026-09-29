# LeelinePackage — Analytics Guide

> Google Analytics 4, installed site-wide through `src/layouts/Layout.astro`. The one non-obvious
> thing here is **why the library is loaded late** — read §2 before "simplifying" it back to the
> snippet Google hands you, because the site's Core Web Vitals were the reason.

---

## 1. What is installed

| | |
|---|---|
| Measurement ID | **`G-1SW1ZD9R55`** (GA4 Data Stream → `leelinepackage.com`) |
| Where it lives | `src/layouts/Layout.astro`, in `<head>` just before `<slot name="head" />` |
| Coverage | **all 177 pages** — verified by grepping the built HTML for the measurement ID |
| Dependencies | none |
| Verified | `google-analytics.com/g/collect?v=2&tid=G-1SW1ZD9R55` observed in the browser; `window.google_tag_manager` contains the `G-1SW1ZD9R55` container |

Because it sits in `Layout.astro`, any new page gets analytics automatically. There is no per-page
opt-in and no second place to update.

---

## 2. ⚠️ Why `gtag.js` is loaded late — do not "fix" this

Google's official snippet pulls ~100 KB of `gtag.js` at parse time. This site's LCP is already
gated by image TTFB measured between **1 s and 11 s** (`docs/seo.md` §10), so a third-party script
opening a competing connection during the critical window is the one thing the critical path cannot
afford.

So only the **queue** is inline. It is byte-for-byte the official bootstrap:

```js
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-1SW1ZD9R55');
```

`gtag()` pushes into `dataLayer` exactly as Google intends, so every `gtag(…)` call site works
normally whether or not the library has arrived. `gtag.js` is then injected by a loader that fires
on the **first of**:

1. `requestIdleCallback` — capped at **3 s** so it can never be starved indefinitely, or
2. `setTimeout(…, 1500)` where `requestIdleCallback` is unavailable, or
3. the first real interaction — `pointerdown` / `keydown` / `touchstart` — so a fast bounce still
   gets counted.

⚠️ **`is:inline` is load-bearing.** Without it Astro bundles this into a `type="module"` script and
`gtag()` would no longer be defined by the time anything calls it. Verified in the built HTML: the
tag is a plain `<script>` with no `type` and no `src`.

> Measured nuance: on a fast local page `requestIdleCallback` fires at roughly the `load` event, so
> the guard is "after parsing", not strictly "after every image". That is enough to keep it off the
> LCP element's back. If you ever want a hard guarantee, gate the loader on `window.load` — at the
> cost of missing very short bounces.

---

## 3. Tracking events

`gtag()` is globally available on every page, so nothing needs importing:

```js
gtag('event', 'generate_lead', { form: 'contact_hero', value: 1 });
```

Send an event **on the interaction itself**, not on page load — a `click` handler fires long after
the library has arrived. If you need to be certain the library is up first:

```js
function whenGaReady(fn) {
  if (window.google_tag_manager) fn();
  else window.addEventListener('ga-ready', fn, { once: true });
}
```

Note that the loader above does **not** currently dispatch a `ga-ready` event; add one if you need
it rather than polling.

GA4 already sends `page_view` for every page automatically (`gtag('config', …)` sends it), so there
is nothing to do for basic traffic reporting.

---

## 4. ⚠️ Consent — an open gap, not an oversight

**GA4 sets cookies. There is no consent banner on this site.** For visitors in the EU/UK that is a
compliance problem, and the site targets European buyers (it links `de.linkedin.com`, and blog
content covers REACH regulations and EU compliance).

Nothing in this repo currently gates analytics on consent. Options, in increasing order of effort:

1. **Consent Mode v2** — keep the snippet, add
   `gtag('consent', 'default', { analytics_storage: 'denied' })` *before* the config call, and flip
   it to `granted` when the visitor accepts. GA4 then runs cookieless until consent is given. This
   is the smallest correct change and Google's documented path.
2. A real CMP (cookie consent platform) that drives Consent Mode.
3. Leave as-is only if the site is willing to accept the risk.

**Until one of these is done, analytics cookies are set for every visitor regardless of
jurisdiction.** Flagged 2026-09-29; not fixed.

---

## 5. Limits of what this tells you

- Nothing is tracked for the **three dead YouTube embeds** beyond the page view
  (`/aqueous-vs-uv-coating/`, `/what-is-a-pr-package/`, `/what-is-kraft-paper/` — see
  `docs/seo.md` §9). A visitor who hits a dead player leaves no signal.
- Image/asset performance and the R2 CDN's missing cache headers (`docs/seo.md` §10) are invisible
  to GA4. If LCP matters commercially, measure it with Real User Monitoring, not GA.
- Because the library loads after idle, GA4 does **not** see aborted early loads. Sessions that
  bounce before the loader fires may be undercounted; the interaction trigger exists to limit that.
