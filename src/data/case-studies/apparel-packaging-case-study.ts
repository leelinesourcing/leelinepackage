import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/apparel-packaging-case-study/`.

  ⚠️ The source gives the title "Sourcing Lead" to two different people (Li on paper tolerances, Chen on
  pulp suppliers). Only one pull-quote per section is used, so the page never shows the same title twice
  in the same role.
  ⚠️ This page's headline is the counter-intuitive one the article makes: the fix was LESS paper, not
  more. Keep that framing — a heavier bag is the obvious wrong answer and the whole page argues against
  it.
*/
export const apparelPackagingCaseStudy: CaseStudy = {
  slug: 'apparel-packaging-case-study',
  category: 'Apparel',
  client: { name: 'Bamford', linkedin: 'https://www.linkedin.com/company/bamford' },

  title: 'How We Cut Apparel Shipping Damage by 28% With Less Paper, Not More',

  lead:
    'Bamford, a mid-market apparel brand, shipped its whole range in one oversized kraft mailer. Conveyor ' +
    'belts punctured it, moisture finished it, and 40% of every bag was empty air the brand paid to fly. ' +
    'The fix was a narrower bag and a lighter sheet.',

  hero: [
    {
      src: `${R2}/blog/media/2026/05/A-smarter-mailer-specification-always-outperforms-excess-material.webp`,
      alt: 'A right-sized apparel mailer beside an oversized one',
      cap: 'Sizing the mailer to the garment, not the range',
      w: 850,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/Structural-Redesign-Decisions.webp`,
      alt: 'The redesigned mailer during structural review',
      cap: 'The redesigned mailer, two inches narrower',
      w: 850,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/I-reviewed-six-months-of-damage-logs-and-observed-the-packers-on-the-fulfillment-b8ba5360.webp`,
      alt: 'Packers working the fulfillment line, observed during the audit',
      cap: 'Six months of damage logs, read on the fulfillment floor',
      w: 850,
      h: 500,
    },
  ],

  verdict: [
    { v: '−28%', k: 'Shipping damage', note: 'measured over three months' },
    { v: '−15%', k: 'Dimensional volume', note: 'per parcel' },
    { v: '<5%', k: 'Void space left', note: 'down from 40%' },
    { v: '$0.38', k: 'Cost per unit', note: 'at the 10,000-unit tier' },
  ],

  facts: [
    { k: 'Client', v: 'Bamford' },
    { k: 'Industry', v: 'Apparel' },
    { k: 'Brief', v: '90 GSM FSC recycled mailer' },
    { k: 'Order', v: '10,000-unit production tier' },
    { k: 'Timeline', v: 'Three months to the result' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'One Mailer, Sized for Nothing in Particular',
    notes: [
      {
        text:
          'This recycled kraft substrate absorbs ink unevenly. The dark blue logo looks faded and rubs off on ' +
          'the sorting conveyor.',
        role: 'Press supervisor, the print floor',
      },
    ],
    intro: [
      'The brand shipped all apparel in a single generic kraft mailer. It was sized for the heaviest item in the range and used for everything, so most parcels carried more air than garment.',
      'On the conveyor that showed up as puncture damage, moisture ingress and scuffing — and a barcode that would not reliably read.',
    ],
    items: [
      {
        n: '01',
        t: 'Forty percent of the bag was empty',
        d: [
          'A void-space measurement on the standard medium mailer came back at 40%. The garment travelled inside it for the whole journey, and internal movement is what scratches and creases on arrival.',
        ],
      },
      {
        n: '02',
        t: 'A label on a surface that will not hold it',
        d: [
          'Scanners failed to read the barcode with the regularity you would expect on a wrinkled, uneven mailer, and mandated warning labels peeled off the same surface.',
        ],
      },
      {
        n: '03',
        t: 'The seal flap failed four times in a hundred',
        d: [
          'The sealing flap gave on 4% of parcels, and each failure cost more than the bag. Uncoated recycled kraft absorbs warehouse humidity, which weakens the seal further.',
        ],
      },
      {
        n: '04',
        t: 'Fifteen hours a week spent re-packing',
        d: [
          'Warehouse staff spent 15 hours every week repacking damaged shipments. Freight was billed on dimensional weight, so the empty space was paid for twice.',
        ],
      },
    ],
    plate: {
      src: `${R2}/blog/media/2026/05/Conveyor-belts-easily-punctured-the-thin-unreinforced-bags.-Moisture-exposure-an-41e5d787.webp`,
      alt: 'Thin unreinforced mailers on a warehouse conveyor belt',
      cap: 'Where the old bag failed: the conveyor line',
      w: 850,
      h: 500,
    },
  },

  change: {
    label: '02 · What We Changed',
    heading: 'Less Paper, Sized Correctly',
    notes: [
      {
        text:
          'Recycled kraft takes on moisture, and a seal specified for virgin stock lets go when it does. The ' +
          'adhesive has to be chosen for the substrate, not for the machine it runs on.',
        name: 'Larry Lanham',
        role: 'CEO & Owner, Polymer Packaging, Inc.',
        linkedin: 'https://www.linkedin.com/in/polymerpkgcom',
      },
    ],
    intro: [
      'The obvious answer was a heavier bag. The one that worked was a narrower one: the mailer came in by two inches, the sheet dropped from 120 GSM to 90, and the adhesive was re-specified for the material it was actually sealing.',
    ],
    steps: [
      {
        n: '01',
        t: 'Take two inches out of the width',
        d: [
          'The mailer came down by two inches. That one change removed the internal travel behind the scuffing, and it cut the dimensional weight with it.',
        ],
      },
      {
        n: '02',
        t: 'Drop the sheet weight, keep the strength',
        d: [
          'A 90 GSM FSC-certified recycled kraft replaced the heavier stock. A right-sized 90 GSM mailer outperforms an oversized 120 GSM one, because the garment is no longer moving inside it.',
        ],
      },
      {
        n: '03',
        t: 'Match the adhesive to the paper',
        d: [
          'Three glue viscosities were tested before a high-tack cross-linked hot melt was specified. An uncoated recycled surface takes on ambient moisture, and a standard glue lets go when it does.',
        ],
      },
      {
        n: '04',
        t: 'Keep the ink away from the edges',
        d: [
          'Heavy ink coverage was pulled back to the centre of the mailer. Barcodes and warning panels sit on a flat, unprinted zone, and the edges carry nothing for a conveyor to rub off.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Read the logs, not the sample',
          d: 'Released after six months of damage records and two weeks on the fulfillment floor, with packers watched rather than interviewed.',
          releasedBy: 'Fulfillment audit',
        },
        {
          when: 'Gate 2',
          t: 'Lock the specification',
          d: 'Released when paper weight, width and adhesive grade were written down, before the first press proof.',
        },
        {
          when: 'Gate 3',
          t: 'Prove the colour holds',
          d: 'Released once ink density was raised 12% and a calendering step smoothed the sheet. Shade drift stopped, and the print stopped rubbing off.',
          releasedBy: 'Press',
        },
        {
          when: 'Gate 4',
          t: 'Seal it in humidity',
          d: 'Released on the seal test alone. A closure that passes in a dry room and fails in a damp transit hub has not passed.',
          releasedBy: 'Quality control',
        },
        {
          when: 'Gate 5',
          t: 'Run the pilot first',
          d: 'Released on a 500-unit pilot through the same line. Nothing ships at volume until a small batch has survived it.',
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
          'Since we synchronized the folding sequence with the new mailer dimensions, my team doubled our hourly ' +
          'pack-out rate. We spend zero time taping down loose corners or double-bagging fragile items.',
        name: 'Floor Manager',
        role: 'Bamford',
      },
    ],
    intro:
      'The headline claim is a 28% cut in shipping damage, achieved with a lighter sheet. The table below is the whole of it.',
    rows: [
      {
        metric: 'Shipping damage',
        before: '4% seal failures, plus puncture',
        after: '1.2% overall defect rate',
        how: 'Damage records from the six months before, then a 500-order audit',
      },
      {
        metric: 'Void space',
        before: '40% of the mailer',
        after: 'Under 5%',
        how: 'Measured against the garment range, not one SKU',
      },
      {
        metric: 'Material per unit',
        before: '102 grams',
        after: '90 grams',
        how: 'Weighed on the production line',
      },
      {
        metric: 'Parcel dimensions',
        before: '12 × 15 inches',
        after: '10 × 13 inches',
        how: 'Measured flat at the packing bench',
      },
      {
        metric: 'Cost per unit',
        before: '$0.45',
        after: '$0.38',
        how: 'Verified at the 10,000-unit production tier',
      },
    ],
    attribution:
      'The damage figure comes from the fulfillment logs kept before the rebuild and the same records three ' +
      'months after. Void space and material weight were measured on the line, and the unit cost was taken off ' +
      'the production invoice rather than a sample quotation.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before You Re-Spec a Mailer',
    notes: [
      {
        text:
          'A specification is a test plan. A pack with a 36-inch drop requirement, a seal-strength test and a ' +
          'colour tolerance has a specification; a description of how it should look is a wish.',
        name: 'Alex Parker',
        role: 'Packaging engineering professional, IoPP Golden Gate Chapter',
        linkedin: 'https://www.linkedin.com/in/alexander-j-parker',
      },
    ],
    intro:
      'The instinct is to buy a thicker bag. These four questions are what stops that instinct from costing you the saving it was meant to make.',
    items: [
      {
        n: '01',
        t: 'Test the closure, not just the sheet',
        d: [
          'Ask which adhesive grade is specified and whether it was tested on the actual substrate. A recycled surface that takes on moisture defeats a glue chosen for virgin stock.',
        ],
      },
      {
        n: '02',
        t: 'Measure void space across the range',
        d: [
          'Forty percent of a mailer is invisible on a spec sheet. Ask for the measurement taken across the garments the bag really ships, not the one it was designed around.',
        ],
      },
      {
        n: '03',
        t: 'Put the barcode on a flat zone',
        d: [
          'A scan failure on a receiving dock rejects an entire pallet. Specify an unprinted, unwrinkled panel for the label, and hold the ink back from it.',
        ],
      },
      {
        n: '04',
        t: 'Count the minutes, not the grams',
        d: [
          'A lighter mailer that takes longer to pack is not cheaper. Ask what the pack-out rate was before and after, on the same line.',
        ],
      },
    ],
  },

  cta: {
    heading: 'Sending Air Is Not Free',
    body:
      'Send us the mailer and the damage it is causing. The reply names the width to cut, the grade to ' +
      'drop, and the adhesive to change.',
  },

  related: ['skincare-packaging-case-study', 'jewelry-packaging-case-study', 'custom-die-cut-windows-case-study'],
};
