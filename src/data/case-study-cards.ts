/*
  Card decoration for `/case-study/`.

  WHY THIS IS NOT IN THE POST FRONTMATTER: `scripts/import-blog.mjs convert` REGENERATES
  `src/content/blog/*.md` from the WordPress export. Anything hand-added to a post's
  frontmatter is overwritten the next time the import runs — `metric`, `metricLabel`,
  `industry` and `summary` were all lost that way once already. So the blog collection owns
  the posts, and this file owns what the index cards show. The two never touch the same file.

  Keyed by post slug — i.e. by `CollectionEntry<'blog'>.id` — so the page can still drive its
  LIST off the collection (a new case study appears by being published) while the figures and
  the industry pill come from here.

  ⚠️ A slug with no entry here is NOT an error: the card falls back to the post's own title and
  the category label, and simply shows no figure and no one-line summary. Add an entry to
  decorate it.
  ⚠️ The minus signs are U+2212 MINUS (−), not hyphen-minus (-), so they match the site's
  display figures.
*/

export interface CaseCardMeta {
  /** The display figure the card leads with, e.g. `'0%'`. */
  metric: string;
  /** The small caps label under the figure, e.g. `'Transit leakage'`. */
  metricLabel: string;
  /** Buyer-facing industry for the pill, e.g. `'Beauty & Skincare'`. */
  industry: string;
  /**
   * One sentence for the card body. Deliberately NOT the post's `description`, which is the
   * Rank Math meta description written for a search result — clamped to a card it reads as a
   * blurb cut off mid-word. Keep these under ~100 characters so a card never truncates.
   */
  summary: string;
}

export const CASE_CARD_META: Record<string, CaseCardMeta> = {
  'skincare-packaging-case-study': {
    metric: '0%',
    metricLabel: 'Transit leakage',
    industry: 'Beauty & Skincare',
    summary: 'A failed 50-unit pilot stopped the launch. The rebuilt jar shipped 50,000 units with no leak.',
  },
  'jewelry-packaging-case-study': {
    metric: '−94%',
    metricLabel: 'Damage claims',
    industry: 'Jewelry',
    summary: 'Breakage dropped to 0.4% and the flat-pack structure cut assembly time to three minutes a unit.',
  },
  'apparel-packaging-case-study': {
    metric: '−28%',
    metricLabel: 'Product damage',
    industry: 'Apparel',
    summary: 'Right-sizing removed 40% of the void space and brought the unit cost down to $0.38.',
  },
  'food-packaging-case-study': {
    metric: '+18%',
    metricLabel: 'Repeat purchases',
    industry: 'Food & Beverage',
    summary: 'Total margin improved even though the new barrier film cost 20% more per unit.',
  },
  'custom-die-cut-windows-case-study': {
    metric: '+42%',
    metricLabel: 'Retail sales',
    industry: 'Beauty Retail',
    summary: 'Shoppers stopped guessing what was inside, and pickup-to-purchase rose to 49% in 60 days.',
  },
  'kitchenware-launch-case-study': {
    metric: '100%',
    metricLabel: 'First-pass barcode scan',
    industry: 'Kitchenware',
    summary: 'Shelf-stocking now takes 15 seconds a case instead of 120, and the first Walmart PO followed.',
  },
  'recycled-corrugated-packaging': {
    metric: '−22%',
    metricLabel: 'Carbon footprint',
    industry: 'Footwear',
    summary: 'Recycled FSC corrugated carried a 7% absolute cut in total emissions for the brand.',
  },
};
