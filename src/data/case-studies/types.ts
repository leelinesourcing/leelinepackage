/*
  Types for the hand-authored case-study article pages.

  ⚠️ WHY THIS IS NOT IN `src/content/blog/*.md`: `scripts/import-blog.mjs convert`
  regenerates every post from the WordPress export, so anything hand-written into a post is
  lost on the next import (it happened once — `metric`, `metricLabel`, `industry` and
  `summary` were all wiped). The same file boundary the index cards use
  (`src/data/case-study-cards.ts`) applies here: the collection owns the post's metadata,
  this file owns the layout's content.

  ⚠️ Every string here is inserted as TEXT or passed through `set:html` untouched, so HTML
  entities are NOT decoded. Use real Unicode: − (U+2212) – — ’ (U+2019) × ° · and U+00A0.
*/

export interface CsImage {
  src: string;
  alt: string;
  /** Rendered caption under the plate. Every photograph on this page needs a role. */
  cap: string;
  w: number;
  h: number;
}

/** A headline figure. `k` is the small-caps label, `note` an optional second line. */
export interface CsMetric {
  v: string;
  k: string;
  note?: string;
}

/** A numbered entry — hanging brass numeral outside the heading. */
export interface CsEntry {
  n: string;
  t: string;
  d: string[];
  /** Optional short list rendered as a hairline-rowed definition block inside the entry. */
  list?: string[];
}

/** An approach step. The person who owned it is carried by the gate it releases, not here. */
export type CsStep = CsEntry;

/** A figure in the client-profile fact row. */
export interface CsFact {
  k: string;
  v: string;
}

/** One stage of the gated sequence: its release condition, and the ROLE that signed it off. */
export interface CsStage {
  when: string;
  t: string;
  d: string;
  /**
   * ⚠️ A ROLE, not a person. The only named people on the page are the credited specialists; the
   * people who actually worked the order are described by what they did.
   */
  releasedBy?: string;
}

/** One row of the page's single real lookup table. */
export interface CsRow {
  metric: string;
  before: string;
  after: string;
  how: string;
}

/**
 * A statement credited on the page, rendered as `text` → `name` → `role` underneath.
 *
 * ⚠️ Two kinds of speaker use this one shape, deliberately — the client's own voice and the external
 * specialists — because the client asked for them to look identical and to sit inside the article
 * rather than in a block of their own (*"说的话和人物都自然融入到前面的文章里面，不要单列"*).
 */
export interface CsStatement {
  text: string;
  /** Omitted when the speaker is described by role rather than named. */
  name?: string;
  role: string;
  /** The person's or the company's own page. */
  linkedin?: string;
}

export interface CaseStudy {
  /** Must equal `CollectionEntry<'blog'>.id`. */
  slug: string;
  /** The industry pill, e.g. 'Beauty & Skincare'. */
  category: string;
  /**
   * The client.
   *
   * ⚠️ `name` must appear verbatim in `lead` — the component links the FIRST mention there and
   * nowhere else, which is the client's instruction: *"公司名在文章最开始有的地方放链接，不是只在
   * Client 下方，之后就可以不用专门强调了"*. Do not also link the Client fact row or a quote's role.
   */
  client: { name: string; linkedin?: string };
  /** Result-led H1. Chicago Title Case, no trailing period. */
  title: string;
  lead: string;
  /**
   * 1–3 photographs for the three-up strip that closes the hero.
   *
   * ⚠️ Keeping the strip in the hero puts the dark verdict band at ~848px, i.e. just below the fold
   * on a 720–800px laptop. Moving it into §01 lifts the band to ~559px and the numbers *are* on the
   * first screen — that was built, shown, and rejected: *"原版更好"*. **The hero keeps its imagery.**
   * If the fold is raised again, do it by shortening the strip or the hero padding, not by moving it.
   */
  hero: CsImage[];
  /** 3–4 headline figures — carried by the page's dark band at display size. */
  verdict: CsMetric[];
  /** The client profile, as [label, value] pairs. */
  facts: CsFact[];
  challenge: {
    label: string;
    heading: string;
    intro: string[];
    items: CsEntry[];
    plate?: CsImage;
    /** Credited statements, rendered inside this section — never as a roster at the foot of the page. */
    notes?: CsStatement[];
  };
  change: {
    label: string;
    heading: string;
    intro: string[];
    steps: CsStep[];
    sequence: { label: string; heading: string; items: CsStage[] };
    /** See the note on `challenge.notes`. */
    notes?: CsStatement[];
    /**
     * The page's ONE drawn module — optional, and zero is fine. Most of these programs do not need
     * one; `skincare` carries it because the whole case hangs on a thread profile that no
     * photograph shows.
     * ⚠️ A figure without a written pair of captions is decoration; both halves are required.
     */
    figure?: {
      label: string;
      /** `thread` = the jar-neck cross-section built for the skincare pilot. */
      art: 'thread';
      a: { t: string; d: string };
      b: { t: string; d: string };
    };
  };
  result: {
    label: string;
    heading: string;
    intro: string;
    /** The page's ONE table: metric / before / after / how it was measured. */
    rows: CsRow[];
    attribution: string;
    notes: CsStatement[];
  };
  demand: {
    label: string;
    heading: string;
    intro: string;
    items: CsEntry[];
    /** See the note on `challenge.notes`. */
    notes?: CsStatement[];
  };
  cta: { heading: string; body: string };
  /** Slugs of the case studies shown under "Related Results". */
  related: string[];
}
