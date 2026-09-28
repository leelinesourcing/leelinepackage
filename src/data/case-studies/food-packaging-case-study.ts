import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/food-packaging-case-study/`.

  ⚠️ The source contradicts itself on oxygen transmission: the table and body say the new pouch runs at
  0.8 cc/m²/day, while a later paragraph says "below 0.1 cc/sqm". This page publishes the 0.8 figure,
  because that is the one the comparison table and the body text both give.
  ⚠️ The old pouch's moisture figure appears ONLY in the table (the body gives the new value alone), so
  the table is the source for that row.
  ⚠️ The client's Operations Director is named in the source; like every other floor-side name here it is
  reduced to the role.
*/
export const foodPackagingCaseStudy: CaseStudy = {
  slug: 'food-packaging-case-study',
  category: 'Food & Beverage',
  client: { name: 'Rare Breed Coffee', linkedin: 'https://www.linkedin.com/company/rare-breed-coffee' },

  title: 'How a Barrier Pouch Added 45 Days of Shelf Life at Three Cents More',

  lead:
    'Rare Breed Coffee, a mid-sized food brand, was selling into national retail on a generic 3-mil pouch. ' +
    'The barrier was adequate, the story was not, and the pouch was quietly costing roughly $12,000 a month ' +
    'in stale stock.',

  hero: [
    {
      src: `${R2}/blog/media/2026/05/The-Solution-of-Engineering-a-Retail-Ready-Sustainable-Barrier.webp`,
      alt: 'The kraft-EVOH pouch standing on a retail shelf',
      cap: 'The rebuilt pouch: FSC kraft face, EVOH barrier behind',
      w: 800,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/Compliance-and-Supplier-Validation.webp`,
      alt: 'A technician preparing a film sample for a food-contact test',
      cap: 'Extraction testing before the material roll was signed off',
      w: 800,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/Within-six-months-the-client-used-our-engineered-pouch-to-increase-repeat-purcha-bf9be56d.webp`,
      alt: 'The finished pouches packed into a retail display carton',
      cap: 'The launched pouch, six months later',
      w: 800,
      h: 500,
    },
  ],

  verdict: [
    { v: '+18%', k: 'Repeat purchases', note: 'over six months' },
    { v: '+45', k: 'Days of shelf life', note: 'with no moisture penalty' },
    { v: '−15%', k: 'Freight cost', note: 'dimensional weight' },
    { v: '+$0.04', k: 'Net margin per unit', note: 'after a three-cent rise' },
  ],

  facts: [
    { k: 'Client', v: 'Rare Breed Coffee' },
    { k: 'Industry', v: 'Food & Beverage' },
    { k: 'Brief', v: 'Kraft-EVOH barrier pouch' },
    { k: 'Order', v: 'Retail-ready, shelf display included' },
    { k: 'Timeline', v: 'Six months to the result' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'A Pouch That Protected the Product and Nothing Else',
    notes: [
      {
        text: 'Without OTR and MVTR validation, this eco-film just creates stale food.',
        role: 'Test technician, our laboratory',
      },
    ],
    intro: [
      'The brand was on a generic 3-mil PET/PE pouch. It kept the product fresh and did nothing else: no story on the shelf, no reason for a shopper to come back, no argument for a retailer to keep the facing.',
      'The obvious replacement — a compostable film — failed on the machine before it reached a shelf.',
    ],
    items: [
      {
        n: '01',
        t: 'Compostable film warped under the heat sealers',
        d: [
          'On the machine trial the new film warped under standard heat sealing. The high heat opened micro-leaks along the gusset, which meant constant daily rework instead of a cleaner pack.',
        ],
      },
      {
        n: '02',
        t: 'Twenty percent more cost, with a weaker barrier',
        d: [
          'Greener alternatives were quoted about 20% higher per unit, and without validated barrier data behind them. Oxygen and moisture transmission have to be measured on the product, not inferred from a material name.',
        ],
      },
      {
        n: '03',
        t: 'Twelve thousand a month in stock nobody could sell',
        d: [
          'The old pouch was costing roughly $12,000 every month in stale, wasted inventory, while national retailers signalled a Q4 delisting over new recycled-content expectations.',
        ],
      },
      {
        n: '04',
        t: 'A seal that snapped at twelve Newtons',
        d: [
          'On a calibrated tensile machine the legacy bottom seals failed at 12 Newtons of force. That is a pouch that survives the warehouse and not the journey.',
        ],
      },
    ],
    plate: {
      src: `${R2}/blog/media/2026/05/Food-Packaging.webp`,
      alt: 'A plain food pouch on a production line',
      cap: 'The legacy pouch: structurally adequate, commercially finished',
      w: 800,
      h: 500,
    },
  },

  change: {
    label: '02 · What We Changed',
    heading: 'A Structure, Not a Material Swap',
    notes: [
      {
        text:
          'A barrier film is a lab result until it meets a heat sealer. The number that decided this pack was not ' +
          'the oxygen rate — it was the twenty degrees the seal head had to move.',
        name: 'Michael Okoroafor, Ph.D.',
        role: 'Former Chief Sustainability Officer, McCormick & Company',
        linkedin: 'https://www.linkedin.com/in/michael-okoroafor-ph-d-5a07b9a9',
      },
    ],
    intro: [
      'Forty hours of floor trials across fifteen candidate laminates produced one answer: keep a kraft face for the shelf, and put the barrier where a barrier belongs.',
    ],
    steps: [
      {
        n: '01',
        t: 'An FSC kraft face at 150 GSM',
        d: [
          'The outer layer is FSC-certified kraft at 150 GSM. It is the part a customer touches, and it carries a paper story that a plastic film cannot.',
        ],
      },
      {
        n: '02',
        t: 'A high-barrier EVOH layer behind it',
        d: [
          'Behind the kraft sits an EVOH barrier film. A fully compostable structure was evaluated and rejected: those materials do not yet carry the grease resistance this product needs.',
        ],
      },
      {
        n: '03',
        t: 'A reseal that survives twenty openings',
        d: [
          'A press-to-close PE zipper was specified to hold past twenty uses, because freshness after the first open is what earns the second purchase.',
        ],
      },
      {
        n: '04',
        t: 'A seal temperature the material actually wants',
        d: [
          'Sealing temperature went from 145°C to 165°C, with jaw pressure up 12%. Roller cleaning went into the startup checklist every two hours, which took startup scrap to zero.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Trial on the real line',
          d: 'Released after a 500-unit run on the actual filling machine. A lab specification rarely accounts for your machine tension or your daily heat fluctuation.',
          releasedBy: 'Line trials',
        },
        {
          when: 'Gate 2',
          t: 'Validate the barrier',
          d: 'Released on transmission data measured at 23°C and 50% relative humidity, taken off a permeation analyzer rather than a datasheet.',
          releasedBy: 'Laboratory',
        },
        {
          when: 'Gate 3',
          t: 'Prove the seal under pressure',
          d: 'Released on burst testing. The legacy pouch failed at 18 PSI and the new structure held to 32.',
          releasedBy: 'Quality control',
        },
        {
          when: 'Gate 4',
          t: 'Clear it for food contact',
          d: 'Released on a hexane extraction test against FDA extraction limits, run on the inner film layer before the material roll was signed off.',
          releasedBy: 'Compliance',
        },
        {
          when: 'Gate 5',
          t: 'Take the cube out',
          d: 'Released when the pack came in 12mm narrower and still held the same volume — 24 more pouches in every master carton.',
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
          'We initially fought the higher unit cost. But the new material stabilized our fill line instantly. We ' +
          'stopped throwing away stale inventory, and our retail partners love the premium look.',
        name: 'Operations Director',
        role: 'Rare Breed Coffee',
      },
    ],
    intro:
      'The headline claim is 45 extra days of shelf life from a pouch that costs three cents more. The table below is the whole of it.',
    rows: [
      {
        metric: 'Oxygen transmission',
        before: '2.5 cc/m²/day',
        after: '0.8 cc/m²/day',
        how: 'Permeation analyzer at 23°C, 50% relative humidity',
      },
      {
        metric: 'Moisture transmission',
        before: '1.2 g/m²/day',
        after: '1.3 g/m²/day',
        how: 'Same instrument, same conditions — held, not improved',
      },
      {
        metric: 'Burst strength',
        before: '18 PSI',
        after: '32 PSI',
        how: 'Air probe, pressurised until the seal fails',
      },
      {
        metric: 'Food waste',
        before: '14% of production',
        after: '2%',
        how: 'Counted from the spoilage records kept on the line',
      },
      {
        metric: 'Unit cost',
        before: '$0.15',
        after: '$0.18',
        how: 'Verified at the production tier, not estimated',
      },
    ],
    attribution:
      'Transmission rates were measured on the same instrument at 23°C and 50% relative humidity, before and ' +
      'after. Burst figures come off the pressure rig, and the shelf-life extension was modelled from accelerated ' +
      'aging and then checked against the client’s own quarterly sales data.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before You Swap a Pouch',
    notes: [
      {
        text:
          'Shelf life and food waste are the same number. Forty-five more days on a pouch is not a packaging win, ' +
          'it is a reduction in what the retailer throws away.',
        name: 'Nerida Kelton FAIP',
        role: 'VP Sustainability & Save Food, World Packaging Organisation',
        linkedin: 'https://au.linkedin.com/in/neridakelton',
      },
    ],
    intro:
      'A material swap is the cheapest-looking change in packaging and the easiest one to lose money on. These four questions are the difference.',
    items: [
      {
        n: '01',
        t: 'Ask for the barrier number, not the material name',
        d: [
          'A number on a supplier datasheet describes a film, not your product. Ask for the measurement taken on what you actually pack, with its test conditions attached.',
        ],
      },
      {
        n: '02',
        t: 'Trial on your line, at your temperature',
        d: [
          'Heat-sealing behaviour changes with the machine and with the room. A 500-unit run on the real line costs a shift and prevents a launch.',
        ],
      },
      {
        n: '03',
        t: 'Price the waste next to the pouch',
        d: [
          'The pouch went up three cents. Stale inventory went from 14% to 2%, which is roughly five cents a unit back. Model both lines, or the cheaper pouch wins an argument it should lose.',
        ],
      },
      {
        n: '04',
        t: 'Measure the carton, not the pouch',
        d: [
          'Dimensional weight is charged on the box, not the product. Twelve millimetres off the pack width put 24 more pouches into every master carton.',
        ],
      },
    ],
  },

  cta: {
    heading: 'Have a Pouch That Goes Stale on the Shelf',
    body:
      'Send us the film and the failure it is causing. The reply names the barrier you actually need, and ' +
      'what the current structure is costing in waste.',
  },

  related: ['skincare-packaging-case-study', 'apparel-packaging-case-study', 'custom-die-cut-windows-case-study'],
};
