import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/custom-die-cut-windows-case-study/`.

  ⚠️ The source breaks its own attribution: a paragraph introduces "QA Manager Peter Zhong" with a LinkedIn
  link, and the dialogue tag two sentences later reads "Davis noted" — while "Davis" is separately
  established as QA Lead. Neither is carried into this page; the quote is attributed by role. Do not "fix"
  the source by guessing which name is right.
  ⚠️ The 42% sales uplift and the 18% → 49% pickup-to-purchase figure are two different measurements the
  article states side by side. They are kept as separate rows rather than derived from each other.
*/
export const dieCutWindowsCaseStudy: CaseStudy = {
  slug: 'custom-die-cut-windows-case-study',
  category: 'Beauty Retail',
  client: { name: 'Oway', linkedin: 'https://www.linkedin.com/company/oway-srl' },

  title: 'How a Die-Cut Window Took Retail Pickup-to-Purchase from 18% to 49%',

  lead:
    'Oway, a botanical beauty brand, ran 14 SKUs in a crowded big-box beauty aisle on a fully opaque ' +
    '350 GSM carton. The hero product is an amber serum in glass — the most persuasive thing on the shelf, ' +
    'and the box hid all of it.',

  hero: [
    {
      src: `${R2}/blog/media/2026/04/Custom-Die-Cut-Windows-Case-study-1.webp`,
      alt: 'A window-patched folding carton on a retail shelf',
      cap: 'The windowed carton, stocked on the endcap',
      w: 800,
      h: 550,
    },
    {
      src: `${R2}/blog/media/2026/04/Visibility-Strategy-and-Window-Placement.webp`,
      alt: 'The window placement drawn over the carton dieline',
      cap: 'Fifteen millimetres from every fold line',
      w: 800,
      h: 420,
    },
    {
      src: `${R2}/blog/media/2026/04/Visual-clarity-comparison-between-150-micron-PET-film-and-standard-PVC.webp`,
      alt: 'PET and PVC window film compared side by side for clarity',
      cap: '150-micron PET against standard PVC',
      w: 800,
      h: 420,
    },
  ],

  verdict: [
    { v: '+42%', k: 'Retail sales uplift', note: 'across the pilot stores' },
    { v: '49%', k: 'Pickup-to-purchase', note: 'from 18%' },
    { v: '0%', k: 'Expectation returns', note: 'down from 4.2%' },
    { v: '3×', k: 'Retail buyer reorders', note: 'per quarter' },
  ],

  facts: [
    { k: 'Client', v: 'Oway' },
    { k: 'Industry', v: 'Beauty Retail' },
    { k: 'Brief', v: 'Window-patched 350 GSM carton' },
    { k: 'Range', v: '14 SKUs in a big-box aisle' },
    { k: 'Timeline', v: '60 days of live retail data' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'A Box the Shopper Had to Guess At',
    notes: [
      {
        text: 'Removing 40% of the front panel destroys the structural integrity.',
        role: 'Quality lead, our factory floor',
      },
    ],
    intro: [
      'Fourteen SKUs ran on a fully opaque 350 GSM carton. The product inside is an amber serum in a glass bottle, and the carton gave a shopper no way to see colour, texture or size before picking it up.',
      'Six months of flat sell-through ended in a 20% discount strategy — the only lever left once the box stops selling itself.',
    ],
    items: [
      {
        n: '01',
        t: 'Pickup-to-purchase fell by 18%',
        d: [
          'The conversion number that matters in a beauty aisle is pickup-to-purchase. It dropped 18% in the fall quarter, and the discount that followed cost margin without changing the cause.',
        ],
      },
      {
        n: '02',
        t: 'A large window takes half the load capacity',
        d: [
          'Opening the front takes out up to half the vertical load capacity, and a 350 GSM carton already fails at 45 lbs of top load — well under a loaded pallet.',
        ],
      },
      {
        n: '03',
        t: 'A missing panel moves the print',
        d: [
          'Take board out of the front and the remaining sheet tensions differently through the press. That shows up as registration errors across every printed panel, not just the one with the cut.',
        ],
      },
      {
        n: '04',
        t: 'Fifteen percent of the first run scuffed',
        d: [
          'On the initial test run, 15% of units were rejected because the machine belts scuffed the exposed film. A window that arrives scratched is worse than no window at all.',
        ],
      },
    ],
    plate: {
      src: `${R2}/blog/media/2026/04/The-Challenge-of-Custom-Die-Cut-Windows.webp`,
      alt: 'An opaque carton stacked in a retail display',
      cap: 'What the shopper saw: a panel, and nothing else',
      w: 800,
      h: 420,
    },
  },

  change: {
    label: '02 · How We Built It',
    heading: 'A Window That Keeps the Board Working',
    notes: [
      {
        text:
          'A window adds a liner and a registration tolerance to a job that already had both. The scrap comes off ' +
          'the belt rather than the die, which is why the fix was a peel-away film and not a tighter cut.',
        name: 'Scott Fisher',
        role: 'Packaging operations, Smyth Companies',
        linkedin: 'https://www.linkedin.com/in/scott-fisher-b558387',
      },
    ],
    intro: [
      'The window works when the board is treated as a structure rather than a picture frame. Three decisions carried it: where the cut sits, what the film is, and how the film is applied.',
    ],
    steps: [
      {
        n: '01',
        t: 'A 15mm bridge, and no closer',
        d: [
          'The cut sits exactly 15 millimetres from every critical fold line. Holding that bridge preserves about 90% of the carton’s vertical strength, which is what keeps a pallet from crushing the range.',
        ],
      },
      {
        n: '02',
        t: 'PET rather than PVC, at 150 microns',
        d: [
          'The film is 0.15mm PET, not PVC. It is clearer, it does not yellow, it stays odour-neutral inside the box, and it bonds to a water-based adhesive without warping the carton edges.',
        ],
      },
      {
        n: '03',
        t: 'Patched from the inside',
        d: [
          'The film goes on as an interior patch rather than a face lamination, held by a high-tack acrylic adhesive under a print-to-cut registration tolerance of ±0.5 millimetres.',
        ],
      },
      {
        n: '04',
        t: 'An anti-scratch liner on the run',
        d: [
          'A peel-away liner runs over the film through the folder-gluer and comes off after. It took the belt-scuff rejection rate to zero and added no days to the lead time.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Prove the board',
          d: 'Released on a compression reading, not on how the dieline looked on screen. A carton that fails at 45 lbs is not ready for a pallet.',
          releasedBy: 'Structural design',
        },
        {
          when: 'Gate 2',
          t: 'Test the film under tension',
          d: 'Released on a tensile reading: the 0.15mm film snapped at 85 lbs against the 60 lbs commercial retail handling requires.',
          releasedBy: 'Quality control',
        },
        {
          when: 'Gate 3',
          t: 'Register the print',
          d: 'Released when a printed prototype held ±0.5mm across the whole sheet, not on the first panel off the press.',
          releasedBy: 'Press',
        },
        {
          when: 'Gate 4',
          t: 'Survive the flat-pack journey',
          d: 'Released after rough flat-pack drop tests with the patch applied. The liner stays on until the box is assembled.',
        },
        {
          when: 'Gate 5',
          t: 'Open it in two seconds',
          d: 'Released when a worker could pop the carton open in two seconds and it still shipped flat, which took roughly 40% out of inbound freight volume.',
          releasedBy: 'Packing line',
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
          'When we stocked the new boxes on the beauty endcap, shoppers stopped asking what the serum looked ' +
          'like. They just grabbed the box, saw the amber glass, and walked to the register.',
        name: 'Merchandising Manager',
        role: 'Partner retail group',
      },
    ],
    intro:
      'The headline claim is a 42% retail sales uplift in sixty days. The table below is the whole of it — what moved, and where each figure came from.',
    rows: [
      {
        metric: 'Pickup-to-purchase',
        before: '18%',
        after: '49%',
        how: 'Counted at the till across the pilot stores',
      },
      {
        metric: 'Retail sales',
        before: 'Baseline quarter',
        after: '+42%',
        how: 'Three pilot stores, 90 days of live data',
      },
      {
        metric: 'Expectation returns',
        before: '4.2%',
        after: '0%',
        how: 'Returns coded to “not as expected”',
      },
      {
        metric: 'Retail buyer reorders',
        before: '1 per quarter',
        after: '3 per quarter',
        how: 'Purchasing records, same buyers',
      },
      {
        metric: 'Unit cost',
        before: '$0.45',
        after: '$0.52',
        how: 'Quoted at the 5,000-unit tier',
      },
    ],
    attribution:
      'The uplift is not a projection. It is 90 days of live retail data from three pilot stores, compared with ' +
      'the same stores over the preceding quarter, and the return figure is coded return reasons rather than an ' +
      'estimate.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before You Cut a Window',
    notes: [
      {
        text:
          'The objection a retail buyer raises about a window is usually the recycling claim, not the look. ' +
          'Whatever film goes in should be chosen with that answer ready, because it is settled at the dieline.',
        name: 'Cory Connors',
        role: 'Sustainable Packaging, Atlantic Packaging',
        linkedin: 'https://www.linkedin.com/in/cory-connors',
      },
    ],
    intro:
      'A window is the cheapest way to sell a product the carton is hiding, and the easiest way to hand a buyer a pallet of crushed stock. These four questions keep it on the right side.',
    items: [
      {
        n: '01',
        t: 'Ask for the load figure after the cut',
        d: [
          'A dieline is not a structure. Ask what vertical load the windowed carton carries, and compare it against what your pallet stack actually weighs.',
        ],
      },
      {
        n: '02',
        t: 'Specify the film, not just the opening',
        d: [
          'PET and PVC are not interchangeable. One stays clear and odour-neutral; the other yellows, and can carry a plasticiser story straight into a recycling claim.',
        ],
      },
      {
        n: '03',
        t: 'Make them run the scratch test',
        d: [
          'Exposed film meets a machine belt on the folder-gluer. Ask for the rejection rate across a full run, not on hand-built samples.',
        ],
      },
      {
        n: '04',
        t: 'Set the tooling against your run size',
        d: [
          'Custom die-cutting used to demand large minimums. Integrated tooling on a 5,000-unit test run is what makes a pilot possible before a national rollout.',
        ],
      },
    ],
  },

  cta: {
    heading: 'If the Shopper Has to Guess, the Box Is the Problem',
    body:
      'Send us the carton and the conversion you are trying to move. The reply names the window geometry ' +
      'and the film, and what the cut will cost your pallet stack.',
  },

  related: ['skincare-packaging-case-study', 'apparel-packaging-case-study', 'food-packaging-case-study'],
};
