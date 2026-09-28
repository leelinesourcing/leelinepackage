import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/recycled-corrugated-packaging/`.

  ⚠️⚠️ UNLIKE THE OTHER SIX, THIS ONE'S CLIENT IS ALREADY NAMED IN THE SOURCE, and every figure on the page
  is the brand's OWN PUBLISHED REPORTING — the 22% product-footprint drop (7.12 → 5.54 kg CO2e), the 7%
  absolute cut attributed to packaging, the 96% ocean-shipping figure and the 5.50 kg CO2e 2025 target all
  come out of Allbirds' annual disclosures. They cannot be reassigned to another company without falsifying
  them, which is why no substitution was made here.
  ⚠️ The source states outright what is NOT public: the ECT rating, the Mullen burst figure, the adhesive
  formula and the freight-dollar saving. This page repeats that, and does not estimate them.
*/
export const recycledCorrugatedCaseStudy: CaseStudy = {
  slug: 'recycled-corrugated-packaging',
  category: 'Footwear',
  client: { name: 'Allbirds', linkedin: 'https://www.linkedin.com/company/allbirds' },

  title: 'How Allbirds Took 7% Off Its Total Emissions with One Box',

  lead:
    'Allbirds shipped every pair twice: in the shoebox, then again inside a separate mailer. Removing that ' +
    'second box was worth a 7% absolute cut in company emissions — and it meant solving a structural ' +
    'problem, not a materials one.',

  hero: [
    {
      src: `${R2}/blog/media/2026/03/Recycled-Corrugated-Packaging.webp`,
      alt: 'The recycled corrugated shipper-shoebox hybrid',
      cap: 'The hybrid: shoebox and shipping box in one',
      w: 800,
      h: 450,
    },
    {
      src: `${R2}/blog/media/2026/03/The-design-brief-called-for-a-true-shipper-shoebox-hybrid.webp`,
      alt: 'The hybrid box design being reviewed against the shoe',
      cap: 'The brief: one box, no outer mailer',
      w: 800,
      h: 600,
    },
    {
      src: `${R2}/blog/media/2026/03/Allbirds-used-its-packaging-redesign-to-drastically-cut-corporate-emissions.webp`,
      alt: 'Boxes moving through a packing line',
      cap: 'One box on the line instead of two',
      w: 800,
      h: 600,
    },
  ],

  verdict: [
    { v: '−22%', k: 'Product carbon footprint', note: '7.12 to 5.54 kg CO₂e in a year' },
    { v: '−7%', k: 'Total emissions', note: 'credited to the packaging change' },
    { v: '96%', k: 'Inbound freight by ocean', note: 'up from 84% by weight' },
    { v: '1', k: 'Box instead of two', note: 'the whole intervention' },
  ],

  facts: [
    { k: 'Client', v: 'Allbirds' },
    { k: 'Industry', v: 'Footwear' },
    { k: 'Brief', v: 'Shipper-shoebox hybrid' },
    { k: 'Standard', v: 'FSC Recycled, chain of custody' },
    { k: 'Target', v: '5.50 kg CO₂e by 2025' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'Two Boxes Where One Would Do',
    notes: [
      {
        text:
          'A 7% emissions drop from a single box design is massive. Using recycled material helped, but engineering ' +
          'the primary pack to survive transit without a secondary shipping box drove the real ROI.',
        role: 'Packaging strategist, our project team',
      },
    ],
    intro: [
      'Every pair shipped twice: once in the shoebox, then again inside a separate mailer. The second box existed only because the first could not survive a courier network on its own.',
      'That is a structural problem wearing a sustainability costume. The customer sees a recycled logo; the warehouse sees double the touches, and the atmosphere carries two boxes of freight.',
    ],
    items: [
      {
        n: '01',
        t: 'The second box doubles the labour',
        d: [
          'When a packer handles two boxes instead of one, assembly time doubles. So does the material bill, and so does the dimensional weight the courier charges on.',
        ],
      },
      {
        n: '02',
        t: 'B-flute does not survive a single-parcel journey',
        d: [
          'Standard B-flute works for an industrial shipper and collapses under the corner loads of single-unit courier transit. Drop testing finds the corners first, and the returns follow.',
        ],
      },
      {
        n: '03',
        t: 'A vague claim is worse than no claim',
        d: [
          'Buyers can tell generic recycled language from a chain-of-custody claim. A brand that cannot show where the fibre came from invites the accusation it was trying to avoid.',
        ],
      },
      {
        n: '04',
        t: 'Every millimetre of air is carbon',
        d: [
          'Container space is paid for in carbon as well as freight. A box even slightly too large multiplies its footprint across every unit that ships in it.',
        ],
      },
    ],
  },

  change: {
    label: '02 · What We Changed',
    heading: 'Certify, Redesign, Then Print',
    notes: [
      {
        text:
          'A recycled label is a chain-of-custody document. The fibre has to be traceable from the recycling plant ' +
          'through pulping to the box line, or the percentage on the front is a claim with nothing behind it.',
        name: 'Robert Lilienfeld',
        role: 'Executive Director, SPRING',
        linkedin: 'https://www.linkedin.com/in/boblilienfeld',
      },
    ],
    intro: [
      'The work ran in three steps, and the order matters: certify the claim, then change the structure, then fix what goes into the print.',
    ],
    steps: [
      {
        n: '01',
        t: 'Certify the fibre before advertising it',
        d: [
          'The board moved to FSC-certified recycled stock under a chain-of-custody protocol that traces the fibre from the recycling plant through pulping to the assembly line. Only then does a recycled label mean anything.',
        ],
      },
      {
        n: '02',
        t: 'Make the shoebox the shipping box',
        d: [
          'The primary box was rebuilt as a shipper-shoebox hybrid, so a single pair ships in the box the customer opens. That removes the outer mailer and the labour that went with it.',
        ],
      },
      {
        n: '03',
        t: 'Change the flute profile',
        d: [
          'B-flute is too bulky for a sharp retail profile. A tight E-flute holds the crush resistance at a thinner gauge, which is what lets one box do both jobs.',
        ],
      },
      {
        n: '04',
        t: 'Take the chemistry out of the print',
        d: [
          'Soy and water-based inks replace heavy chemical inks, adhesives are limited and self-locking tabs do the structural work, and no single-use polybag goes inside.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Certify the material',
          d: 'Released when the fibre carried an FSC Recycled claim and a chain-of-custody trail behind it. A recycled percentage with no trail is a marketing number.',
          releasedBy: 'Material sourcing',
        },
        {
          when: 'Gate 2',
          t: 'Make the claim auditable',
          d: 'Released when an auditor could follow the paper from the recycling plant to the assembly line, and the result went into published reporting rather than a press release.',
          releasedBy: 'Compliance',
        },
        {
          when: 'Gate 3',
          t: 'Engineer the hybrid box',
          d: 'Released when the primary pack survived courier abuse alone — the drop, compression and corner tests that had justified the second box in the first place.',
          releasedBy: 'Packaging engineering',
        },
        {
          when: 'Gate 4',
          t: 'Optimize the print and the glue',
          d: 'Released when the inks washed clean in pulping and the structure held on self-locking tabs rather than adhesive.',
          releasedBy: 'Production',
        },
        {
          when: 'Gate 5',
          t: 'Publish against the audited result',
          d: 'Released only against the company’s own annual reporting. The 22% and the 7% are the brand’s published figures, not a vendor estimate.',
          releasedBy: 'Reporting',
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
          'We are constantly learning and adapting our approach to climate work. This packaging shift proves that ' +
          'continuous, structural improvements yield real numbers.',
        name: 'Tim Brown',
        role: 'Co-Founder, Allbirds',
      },
    ],
    intro:
      'The headline claim is a 22% cut in average product carbon footprint, with 7% of the company total credited to the packaging change. Here is where each figure comes from.',
    rows: [
      {
        metric: 'Average product footprint',
        before: '7.12 kg CO₂e (2022)',
        after: '5.54 kg CO₂e (2023)',
        how: 'Annual product footprint reporting, as published',
      },
      {
        metric: 'Total emissions',
        before: 'Baseline',
        after: '−7% absolute',
        how: 'Attributed to the packaging architecture in the same reporting',
      },
      {
        metric: 'Inbound freight by ocean',
        before: '84% by weight (2021)',
        after: '96% by weight (2023)',
        how: 'The brand’s annual flight status disclosure',
      },
      {
        metric: '2025 target',
        before: '—',
        after: '5.50 kg CO₂e',
        how: 'The published target the result was measured against',
      },
      {
        metric: 'Baseline shoebox',
        before: '178 g, 100% virgin board',
        after: 'Recycled hybrid, single box',
        how: 'The comparison unit the brand reports against',
      },
    ],
    attribution:
      'All five figures are the brand’s own published reporting — its annual product footprint disclosure and its ' +
      'flight status report — not our measurements. The exact edge crush rating, the Mullen burst figure, the ' +
      'adhesive formula and the freight-dollar saving are not public, and this page does not guess at them.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before You Claim a Material',
    notes: [
      {
        text:
          'Recyclable by weight is a material property. Recyclable in practice is a system property. The gap ' +
          'between those two sentences is where a packaging claim quietly stops being true.',
        name: 'Tom Szaky',
        role: 'Founder & CEO, TerraCycle',
        linkedin: 'https://www.linkedin.com/in/tomszaky',
      },
    ],
    intro:
      'This program is unusual in that the client published its own numbers. Most do not, which is exactly why the questions below are worth asking early.',
    items: [
      {
        n: '01',
        t: 'Ask for the chain of custody, not the percentage',
        d: [
          'A recycled content figure with no traceable trail is not yet a claim. Ask who audited the fibre, and at which points along the chain.',
        ],
      },
      {
        n: '02',
        t: 'Test the primary pack on its own',
        d: [
          'If a shoebox needs a mailer, the mailer is the packaging. Ask what the primary pack survives before accepting a secondary one as normal.',
        ],
      },
      {
        n: '03',
        t: 'Price the second box honestly',
        d: [
          'Double-boxing hides its cost in labour, material and dimensional weight. Put all three on the page before comparing it to a structural redesign.',
        ],
      },
      {
        n: '04',
        t: 'Publish the number you can defend',
        d: [
          'Every figure on this page is the brand’s own, from its own annual reporting. When the data is public, the claim does not need a footnote.',
        ],
      },
    ],
  },

  cta: {
    heading: 'Two Boxes Are a Design Decision',
    body:
      'Send us the primary pack and the secondary one. The reply names which of the two the product ' +
      'actually needs.',
  },

  related: ['apparel-packaging-case-study', 'skincare-packaging-case-study', 'kitchenware-launch-case-study'],
};
