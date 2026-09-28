import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/kitchenware-launch-case-study/`.

  ⚠️ The source credits the same 15-degree perforation to two different people (Engineer Wu in Phase 2 and
  "Mapping the Metrics", Manager Chen in Takeaway 3). Nothing here names them, so the contradiction does
  not propagate.
  ⚠️ The retailer is named in the source ("a Walmart PO"). That is carried as a milestone, not as an
  endorsement, and no Walmart logo, colour or brand asset is used.
*/
export const kitchenwareLaunchCaseStudy: CaseStudy = {
  slug: 'kitchenware-launch-case-study',
  category: 'Kitchenware',
  client: { name: 'STUR', linkedin: 'https://de.linkedin.com/company/sturcookware' },

  title: 'How a Startup Took Transit Damage Below 1% and Won a National Retail PO',

  lead:
    'STUR, a kitchenware startup, shipped nested ceramic bowls and heavy stainless tools from a successful ' +
    'crowdfunding campaign into its first big-box launch. The mailer that survived Kickstarter was never ' +
    'going to survive a pallet.',

  hero: [
    {
      src: `${R2}/blog/media/2026/04/The-Solution-Engineering-A-Retail-System.webp`,
      alt: 'The retail-ready kitchenware carton and display tray',
      cap: 'The retail system: carton, tray and case',
      w: 900,
      h: 490,
    },
    {
      src: `${R2}/blog/media/2026/04/Engineer-the-Retail-Ready-Tray.webp`,
      alt: 'The self-locking display tray on a shelf fixture',
      cap: 'The tray becomes the shelf display',
      w: 900,
      h: 490,
    },
    {
      src: `${R2}/blog/media/2026/04/By-optimizing-the-packaging-we-delivered-distinct-wins-across-the-supply-chain.webp`,
      alt: 'Stacked cases of the kitchenware range on a pallet',
      cap: '156 units a pallet, up from 120',
      w: 1000,
      h: 563,
    },
  ],

  verdict: [
    { v: '<1%', k: 'Transit damage', note: 'down from 15%' },
    { v: '100%', k: 'First-pass barcode scan', note: 'up from 60%' },
    { v: '15 sec', k: 'To stock a case', note: 'down from 120' },
    { v: '156', k: 'Units per pallet', note: 'up from 120' },
  ],

  facts: [
    { k: 'Client', v: 'STUR' },
    { k: 'Industry', v: 'Kitchenware' },
    { k: 'Brief', v: 'B-flute carton and retail tray' },
    { k: 'Order', v: '500-unit pilot, then rollout' },
    { k: 'Timeline', v: 'Under four weeks to the pivot' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'A Crowdfunding Box, Facing a Pallet',
    notes: [
      {
        text:
          'This standard E-flute board completely buckles under the nested ceramics. You face a 15% crush rate ' +
          'before the truck even leaves the dock.',
        role: 'Warehouse lead',
      },
    ],
    intro: [
      'The brand had validated demand online and was heading into its first national launch. The packaging that got it there was a single-wall mailer built to move one parcel at a time.',
      'Wholesale changes the job. A retail pack has to work as a consumer unit, a case-packed wholesale unit and a shelf display at once, and the original failed at all three.',
    ],
    items: [
      {
        n: '01',
        t: 'Forty-five pounds where eighty were needed',
        d: [
          'A compression test on the original 32 ECT E-flute had it collapsing at 45 lbs of top load. Safe pallet stacking needs 80. The projection was a 15% crush rate before the load ever reached a truck.',
        ],
      },
      {
        n: '02',
        t: 'One barcode for three shipping layers',
        d: [
          'A single consumer UPC was printed on every layer. That works for parcels and fails the moment product moves into wholesale, where a case-level scan failure rejects a whole delivery at the dock.',
        ],
      },
      {
        n: '03',
        t: 'A coating nobody had verified',
        d: [
          'Kitchen tools carry food-contact obligations, and the original board used unverified barrier coatings. Left alone, that is a chemical migration question with a $25,000 chargeback attached.',
        ],
      },
      {
        n: '04',
        t: 'A box that wasted shelf and store labour',
        d: [
          'The old design had no load-bearing stackability and gave away 20% of its shelf space. It had no tear strip either, so a clerk opened it with a knife and damaged the display doing it.',
        ],
      },
    ],
    plate: {
      src: `${R2}/blog/media/2026/04/The-Challenge-Of-Kitchenware-Box-Retail-Packaging.webp`,
      alt: 'The original kitchenware mailer in a warehouse',
      cap: 'The original mailer: adequate for one parcel, not for a pallet',
      w: 900,
      h: 490,
    },
  },

  change: {
    label: '02 · What We Changed',
    heading: 'One System, Three Shipping Layers',
    notes: [
      {
        text:
          'Units per pallet is the number a packaging engineer is graded on. This one moved from 120 to 156 ' +
          'without changing the product, which is freight that never gets paid.',
        name: 'Oliver Campbell',
        role: 'Director and Distinguished Engineer, Dell Technologies',
        linkedin: 'https://www.linkedin.com/in/oliverfrankcampbell/',
      },
    ],
    intro: [
      'The graphics were never the problem. The structure was, and that structure had to serve a shelf, a case and a pallet at the same time.',
    ],
    steps: [
      {
        n: '01',
        t: 'A board that carries the load',
        d: [
          'The E-flute came out for a high-compression B-flute, and the base moved again to a B/C double-wall corrugate after a pallet test buckled under 800 lbs of dynamic load.',
        ],
      },
      {
        n: '02',
        t: 'A tray that becomes the shelf',
        d: [
          'A self-locking secondary tray turns the case directly into the display. A knife-less tear strip, set at a 15-degree perforation, opens it in one clean step.',
        ],
      },
      {
        n: '03',
        t: 'Barcodes that read at every layer',
        d: [
          'Individual GTINs on the consumer packs, ITF-14 on the master cases, GS1-128 on the pallets. Three layers, three labels, each scanning first time on the receiving dock.',
        ],
      },
      {
        n: '04',
        t: 'A barrier with a documented answer',
        d: [
          'The unverified coating was replaced with a plant-based barrier, and a food-contact checkpoint was written into the process before the board was chosen rather than after.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Measure the pack we have',
          d: 'Released once compression and drop numbers were taken on the actual carton rather than carried over from the crowdfunding specification.',
          releasedBy: 'Warehouse audit',
        },
        {
          when: 'Gate 2',
          t: 'Redefine the retail brief',
          d: 'Released when the dieline answered the whole brief — identify, open, stock, shop, dispose — with a named feature against each.',
        },
        {
          when: 'Gate 3',
          t: 'Lock the barcode architecture',
          d: 'Released when GTIN, ITF-14 and GS1-128 were all mapped before printing, because a label change after print is a reprint.',
          releasedBy: 'Prepress',
        },
        {
          when: 'Gate 4',
          t: 'Prove it under load',
          d: 'Released on the ISTA sequence. The 18-inch drop passed, and the rotary vibration test found the pallet fault that mattered.',
        },
        {
          when: 'Gate 5',
          t: 'Pilot before rollout',
          d: 'Released on a 500-unit run, which also caught the perforation angle and the change to pallet density.',
          releasedBy: 'Production',
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
          'Our retail buyer demanded strict GS1 label compliance and a zero-damage guarantee. This new structural ' +
          'design did not just protect our ceramic bowls in transit. It proved our operational maturity and ' +
          'secured our first national rollout.',
        name: 'Founder',
        role: 'STUR',
      },
    ],
    intro:
      'The headline claims are a transit damage rate below 1% and a first-pass barcode scan of 100%. The table below is the whole of it.',
    rows: [
      {
        metric: 'Transit damage',
        before: '15%',
        after: 'Under 1%',
        how: 'The client’s receiving data across pilot and rollout',
      },
      {
        metric: 'First-pass barcode scan',
        before: '60%',
        after: '100%',
        how: 'Scanned at the dock, every case',
      },
      {
        metric: 'Shelf-stock time',
        before: '120 seconds a case',
        after: '15 seconds',
        how: 'Timed in-store on the same fixture',
      },
      {
        metric: 'Units per pallet',
        before: '120',
        after: '156',
        how: 'Counted on the built pallet',
      },
      {
        metric: 'Top-load capacity',
        before: '45 lbs',
        after: 'Above the 80 lbs stacking requirement',
        how: 'Compression test on the production carton',
      },
    ],
    attribution:
      'The damage rate is the client’s own receiving data across the pilot and the first rollout, not a sample. ' +
      'Scan rates were recorded at the dock on every case, and the stock times were taken on the shop floor, ' +
      'before and after.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before a Retail Launch',
    notes: [
      {
        text:
          'A retail launch is decided on the dock, not on the shelf. A rejected pallet, a missed delivery window ' +
          'and a chargeback are the costs that fund a redesign; the shelf appeal is a bonus.',
        name: 'Anthony (Tony) Perrotta',
        role: 'Partner, Sustainability & Regenerative Economy, PA Consulting',
        linkedin: 'https://www.linkedin.com/in/anthonyperrotta',
      },
    ],
    intro:
      'The distance between a crowdfunding pack and a retail pack is not graphics. It is a stack of measurements a young company has no reason to have taken yet.',
    items: [
      {
        n: '01',
        t: 'Ask for the load figure against your pallet',
        d: [
          'Forty-five pounds is a reasonable number for one parcel and a failing one for a stack. Ask what the carton carries, then ask what the pallet weighs.',
        ],
      },
      {
        n: '02',
        t: 'Map the barcodes before the press runs',
        d: [
          'A consumer UPC on a wholesale case fails at the dock, and the fix is a reprint. Name the label for each shipping layer while it is still cheap.',
        ],
      },
      {
        n: '03',
        t: 'Get the food-contact answer in writing',
        d: [
          'An unverified coating on a kitchen product is a migration question that ends in a chargeback. Ask for the test result, not the assurance.',
        ],
      },
      {
        n: '04',
        t: 'Make the store clerk faster',
        d: [
          'Shelf-stock time is a cost the buyer sees and the shopper never does. A tear strip and a tray that turns into the display are what earn the second order.',
        ],
      },
    ],
  },

  cta: {
    heading: 'A Crowdfunding Box Is Not a Retail Box',
    body:
      'Send us the carton and the launch date. The reply names what will fail at the dock, and which ' +
      'measurement to take first.',
  },

  related: ['food-packaging-case-study', 'custom-die-cut-windows-case-study', 'recycled-corrugated-packaging'],
};
