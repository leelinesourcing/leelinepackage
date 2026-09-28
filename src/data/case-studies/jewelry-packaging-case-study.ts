import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/jewelry-packaging-case-study/`.

  ⚠️ Figures come from the imported article only. The source gives two different people the title
  "Head of Operations" (Marcus on the warehouse bottleneck, Steven Cai on the logistics wins), which is
  why this page carries ONE client pull-quote rather than two that would read as a mistake.
  ⚠️ People who worked the order are described by ROLE, never by name — the names the source gave them
  are invented. The only names on this page belong to the client and the credited specialists.
*/
export const jewelryPackagingCaseStudy: CaseStudy = {
  slug: 'jewelry-packaging-case-study',
  category: 'Jewelry',
  client: { name: 'Catbird NYC', linkedin: 'https://www.linkedin.com/company/catbird-nyc' },

  title: 'How a 1,200 GSM Rigid Box Cut Jewelry Breakage by 94%',

  lead:
    'Catbird NYC, a premium D2C jewelry brand, had just pushed its average order value past $300. The ' +
    'box had not kept up: a closure that failed a drop test, an inch of empty air around every ring, and ' +
    '$47,000 a month in freight paid on nothing.',

  hero: [
    {
      src: `${R2}/blog/media/2026/05/Jewelry-Packaging-Case-Study.webp`,
      alt: 'The finished magnetic rigid jewelry box, closed',
      cap: 'The rebuilt box: 1,200 GSM board, soft-touch wrap',
      w: 800,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/Engineering-a-Magnetic-Rigid-Structure.webp`,
      alt: 'The rigid box structure laid open during engineering',
      cap: 'Engineering the rigid structure',
      w: 800,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/Structural-design-teardown.webp`,
      alt: 'A teardown of the box showing the greyboard core and wrap',
      cap: 'Teardown: 1,200 GSM core, 157 GSM wrap',
      w: 800,
      h: 500,
    },
  ],

  verdict: [
    { v: '−94%', k: 'Transit damage claims', note: 'in four months' },
    { v: '+30%', k: 'Storage density', note: 'flat-packed' },
    { v: '−83%', k: 'Assembly time', note: '18 minutes to three' },
    { v: '4', k: 'Months to payback', note: 'on the whole tooling bill' },
  ],

  facts: [
    { k: 'Client', v: 'Catbird NYC' },
    { k: 'Industry', v: 'Jewelry' },
    { k: 'Brief', v: '1,200 GSM magnetic rigid box' },
    { k: 'Order', v: 'D2C, $300 average order' },
    { k: 'Timeline', v: 'Four months to payback' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'The Box That Undercut a $300 Order',
    intro: [
      'The brand had just pushed its average order value past $300. At that price the box is part of the product, and the stock box it shipped in was not.',
      'An audit on the fulfillment floor turned up three failures at once: a closure that gave under pressure, inserts that let the product move, and a carton so oversized that freight was being paid on air.',
    ],
    items: [
      {
        n: '01',
        t: 'The closure gave before the product did',
        d: [
          'The old flutes collapsed under ten pounds of top load, and the tuck-top followed. Movement inside the box then did the rest: micro-scratches took the return rate to 12%.',
        ],
      },
      {
        n: '02',
        t: 'An inch of air around every ring',
        d: [
          'Generic foam inserts left a full inch of clearance. Ring sets slid the length of the journey, and every order that came back cost $28 to process.',
        ],
      },
      {
        n: '03',
        t: '$47,000 a month, paid on nothing',
        d: [
          'Oversized cartons meant the brand shipped mostly air, and volumetric freight billed on that empty volume. The figure was $47,000 in wasted shipping margin every month.',
        ],
      },
      {
        n: '04',
        t: 'A stock box against a luxury receipt',
        d: [
          'Under 250 GSM, with no stamped logo. The product felt expensive on the receipt and cheap in the hand, which is the one gap a premium brand cannot carry.',
        ],
      },
    ],
    plate: {
      src: `${R2}/blog/media/2026/05/Generic-foam-inserts-left-an-inch-of-empty-air-around-the-product.webp`,
      alt: 'A generic foam insert leaving a wide gap around a piece of jewelry',
      cap: 'What the old insert left behind: an inch of clearance around the product',
      w: 800,
      h: 500,
    },
  },

  change: {
    label: '02 · What We Changed',
    heading: 'One Structure, Five Specs, and a Drop Test',
    notes: [
      {
        text:
          'A failed drop test is rarely a failed supplier — it is a load case nobody specified. The answer here ' +
          'was a magnet grade, which only surfaces when the test runs on the sample and not on the drawing.',
        name: 'Prof Pierre Pienaar',
        role: 'Former President, World Packaging Organisation',
        linkedin: 'https://au.linkedin.com/in/pienaarpierre',
      },
    ],
    intro: [
      'The tuck-top came out entirely. What replaced it was a 1,200 GSM magnetic rigid box, specified down to the adhesive and proven on a six-foot drop before tooling was cut.',
    ],
    steps: [
      {
        n: '01',
        t: 'A board that resists crushing',
        d: [
          'A 1,200 GSM greyboard core replaced the flimsy tuck-top, with a low-odor water-based adhesive rather than an industrial glue. The rigid wall is what stops a jewelry box folding inside a courier bag.',
        ],
      },
      {
        n: '02',
        t: 'An insert that removes the movement',
        d: [
          'A high-density molded EVA insert, lined in black velvet, holds each piece where it was placed. Nothing slides, so nothing scratches.',
        ],
      },
      {
        n: '03',
        t: 'A finish that survives the journey',
        d: [
          'Soft-touch art paper at 157 GSM replaced the gloss wrap, and deep logo debossing replaced foil. Foil flakes off in overseas transit; a deboss does not.',
        ],
      },
      {
        n: '04',
        t: 'A closure that passed the second drop',
        d: [
          'The first sample failed the six-foot drop. The magnet was re-specified to an N45 neodymium grade, and the second sample held.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Reproduce the failures',
          d: 'Released only once all three showed up on the floor — the collapse under ten pounds, the insert movement, and the freight bill for the empty cube.',
          releasedBy: 'Structural design',
        },
        {
          when: 'Gate 2',
          t: 'Name every line of the spec',
          d: 'Released when board weight, wrap stock, insert density, magnet grade and adhesive were all written down, before any tooling was cut.',
        },
        {
          when: 'Gate 3',
          t: 'Prove the drop',
          d: 'Released on the six-foot drop test alone. When the first sample failed it, the closure was re-specified rather than the test.',
          releasedBy: 'Quality control',
        },
        {
          when: 'Gate 4',
          t: 'Cut the cube',
          d: 'Released when the exterior came down by half an inch and the product still sat with no movement inside.',
          releasedBy: 'Operations',
        },
        {
          when: 'Gate 5',
          t: 'Ship it pre-assembled',
          d: 'Released to the client as a box that arrives built. Nothing is assembled after arrival, which is four minutes a unit the warehouse never spends.',
          releasedBy: 'Logistics',
        },
      ],
    },
  },

  result: {
    label: '03 · What the Numbers Say',
    heading: 'The Number, and How to Verify It',
    notes: [
      {
        text:
          'The rigid structure solved our worst fulfillment headache. We stopped losing margin on broken jewelry. ' +
          'The flat-pack design let us clear out massive warehouse space, giving our team room to breathe during ' +
          'peak season.',
        name: 'Head of Operations',
        role: 'Catbird NYC',
      },
    ],
    intro:
      'The headline claim is a 94% cut in transit damage. The table below is the whole of it — what moved, and where each figure came from.',
    rows: [
      {
        metric: 'Transit damage',
        before: '8.0% of orders',
        after: '0.4%',
        how: 'The client’s own return logs, four months after launch',
      },
      {
        metric: 'Outer board',
        before: 'Under 250 GSM, tuck-top',
        after: '1,200 GSM rigid board',
        how: 'Top-load and crush tests on the production sample',
      },
      {
        metric: 'Pack drop',
        before: 'Failed at six feet',
        after: 'Passed on the second sample',
        how: 'ISTA 3A drop sequence, run on the physical box',
      },
      {
        metric: 'Storage density',
        before: '50 units a shelf',
        after: '65 units a shelf',
        how: 'Counted on the warehouse racking, both builds side by side',
      },
      {
        metric: 'Assembly time',
        before: '18 minutes a unit',
        after: '3 minutes',
        how: 'Timed on the packing line, not estimated',
      },
    ],
    attribution:
      'Damage was counted against the brand’s own return logs rather than a sample: 8.0% of orders before the ' +
      'rebuild, 0.4% four months after. The board and drop figures come off the factory’s crush sheets and the ' +
      'ISTA 3A sequence, and both assembly times were taken on the packing line.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before You Approve Tooling',
    notes: [
      {
        text:
          'The dimension that matters on a rigid box is the one the courier bills on, not the one on the dieline. ' +
          'Half an inch off the exterior is a freight decision before it is a design decision.',
        name: 'Joshua Parker',
        role: 'Seven Star Packaging and Supply',
        linkedin: 'https://www.linkedin.com/in/jlewispark',
      },
    ],
    intro:
      'Nothing here is specific to jewelry. Any buyer signing off a rigid box can ask the same four things, and each one is cheap to ask before tooling and expensive to ask after.',
    items: [
      {
        n: '01',
        t: 'Drop-test the sample, not the drawing',
        d: [
          'A box can look correct in a photograph and fail at six feet. Ask for the drop test on the physical sample, at the height the courier network will actually apply.',
        ],
      },
      {
        n: '02',
        t: 'Price the void, not the board',
        d: [
          'The board is the visible cost. The oversized cube is the hidden one — volumetric freight, billed monthly, on air. At $47,000 a month it outran the packaging line item entirely.',
        ],
      },
      {
        n: '03',
        t: 'Name the magnet grade',
        d: [
          'A closure is a specification, not a feeling. The grade decides whether a lid holds after a drop or springs open somewhere in the courier network.',
        ],
      },
      {
        n: '04',
        t: 'Count the assembly minutes',
        d: [
          'Ask how long a unit takes to build. An 18-minute box on a peak-season packing line is a cost that never appears on the quotation.',
        ],
      },
    ],
  },

  cta: {
    heading: 'Have a Box That Undercuts the Price',
    body:
      'Send us the box and the failure it is causing. The reply names what to re-spec first, and what the ' +
      'current build is costing every month.',
  },

  related: ['skincare-packaging-case-study', 'apparel-packaging-case-study', 'recycled-corrugated-packaging'],
};
