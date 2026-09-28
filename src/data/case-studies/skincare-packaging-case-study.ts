import type { CaseStudy } from './types';

const R2 = 'https://img.leelinepackage.com';

/*
  `/skincare-packaging-case-study/` — the pilot article for the case-study template.

  Written to `Case Stuyd.MD` (challenge-first, because this is a manufacturing program): client profile
  → the challenge → what we did differently → results in Before → After with the measurement method
  named → transferable takeaways → soft CTA.

  ⚠️ Every figure below is one the source article already published. Nothing here is a projection and
  nothing is rounded up. Where the source has no number, the cell says what was done instead of
  inventing a percentage.
  ⚠️ The floor-side names the source invented are reduced to ROLES. The only names on the page are the
  client and the credited specialists, and the client's link sits on its first mention in `lead`.
*/
export const skincarePackagingCaseStudy: CaseStudy = {
  slug: 'skincare-packaging-case-study',
  category: 'Beauty & Skincare',
  client: { name: 'Wildsmith Skin', linkedin: 'https://www.linkedin.com/company/wildsmith-skin' },

  title: 'How We Took a Skincare Launch from a 15% Leak Risk to 0% Across 50,000 Units',

  lead:
    'Wildsmith Skin, preparing a first at-scale run for Western retail and DTC. The order was 50,000 ' +
    'glass-dropper units, and the closure thread failed a torque check before mass production had started. ' +
    'The brand halted the trial run rather than ship it.',

  hero: [
    {
      src: `${R2}/blog/media/2026/05/The-client-launched-the-redesigned-PETG-and-rigid-box-system-1.webp`,
      alt: 'The redesigned PETG jar and rigid presentation box, as launched',
      cap: 'The launched system: PETG jar and rigid box',
      w: 800,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/The-Solution-of-Custom-Skincare-Packaging-Case-Study.webp`,
      alt: 'The rebuilt primary and secondary packaging laid out together',
      cap: 'Primary and secondary, rebuilt as one structure',
      w: 800,
      h: 500,
    },
    {
      src: `${R2}/blog/media/2026/05/I-personally-verified-the-cosmetic-jar-leak-testing-procedures-alongside-Technic-25f57749.webp`,
      alt: 'A technician holding a jar at the vacuum leak-test chamber',
      cap: 'Vacuum held at −0.06 MPa, three minutes',
      w: 800,
      h: 500,
    },
  ],

  verdict: [
    { v: '0%', k: 'Transit leakage', note: 'across 50,000 shipped units' },
    { v: '22%', k: 'DTC sales uplift', note: 'launch window' },
    { v: '40 hrs', k: 'QA approvals saved', note: 'per batch' },
    { v: '12%', k: 'Lighter shipment', note: 'wall structure' },
  ],

  facts: [
    { k: 'Client', v: 'Wildsmith Skin' },
    { k: 'Industry', v: 'Beauty & Skincare' },
    { k: 'Brief', v: 'PETG jar + rigid box system' },
    { k: 'Volume', v: '50,000 units, first run' },
    { k: 'Timeline', v: 'One quarter to launch' },
  ],

  challenge: {
    label: '01 · The Challenge',
    heading: 'The Flaw a Sample on a Table Cannot Show',
    notes: [
      {
        text:
          'The glass thread tolerances vary by a fraction of a millimeter. If we run this at full production speed, ' +
          'the closure grips unevenly. It will leak during air freight.',
        role: 'Leak-test technician, Shenzhen assembly floor',
      },
    ],
    intro: [
      'The brand approved the jar from a handmade prototype. It sat on a boardroom table, it looked immaculate, and it passed the only checks that room could offer.',
      'The fault only existed at production speed. Run unchanged, the projected rate in air freight was 15% — a figure nobody had a reason to doubt until the pilot run.',
    ],
    items: [
      {
        n: '01',
        t: 'The thread only fails in motion',
        d: [
          'A prototype is capped by hand. The fault appears under the capping machine, where uneven grip becomes a gap — which is why the sample inspection passed and the trial run did not.',
        ],
      },
      {
        n: '02',
        t: 'Ten closures is all it takes',
        d: [
          'Standard acrylic micro-fractured at the neck thread after ten tight closures. On a desk the jar reads as flawless; under air-freight pressure the wall is what fails first.',
        ],
      },
      {
        n: '03',
        t: 'A visual check cannot see a micro-gap',
        d: [
          'A container can pass a visual inspection and still leak. Pressure drops during flight force liquid through openings too small for an inspector to find by eye. Only a vacuum hold catches them.',
        ],
      },
      {
        n: '04',
        t: 'What shipping it unchanged would have cost',
        d: ['Four costs landed on the brand at once, and only one of them was the product:'],
        list: [
          'Refund claims on every unit that arrived wet',
          'A launch window pushed back by reworking bad batches',
          'Retail and DTC trust, which a leak destroys faster than a price rise',
          'A higher landed cost per unit once rejects were counted',
        ],
      },
    ],
    plate: {
      src: `${R2}/blog/media/2026/05/As-Technician-Wang-prepared-the-leak-test-station-he-tapped-the-capping-machine.webp`,
      alt: 'A technician adjusting the capping machine at the leak-test station',
      cap: 'Where the fault surfaced — the capping machine at the Shenzhen line',
      w: 800,
      h: 500,
    },
  },

  change: {
    label: '02 · What We Changed',
    heading: 'Three Layers, Fixed in Order',
    notes: [
      {
        text:
          'Two claims sit on a pack like this one: an FSC board and a polymer chosen for impact. The first is a ' +
          'chain of custody; the second is only as good as the pressure data behind it.',
        name: 'Rhodes Yepsen',
        role: 'Executive Director, Biodegradable Products Institute',
        linkedin: 'https://www.linkedin.com/in/rhodesyepsen/',
      },
    ],
    intro: [
      'A cosmetic tweak would not have survived global logistics. The fix ran in three layers — the primary container, the presentation system, and a control cadence that put a measured number on every batch.',
    ],
    figure: {
      label: 'Why the thread was the whole problem',
      art: 'thread',
      a: {
        t: 'Acrylic, as supplied',
        d: 'The neck thread cracks under repeated closures. The cap torques down unevenly, and the pressure hold never gets started.',
      },
      b: {
        t: 'PETG, as rebuilt',
        d: 'The same profile in a material that keeps its shape under load. Sampled units sealed on the first hold, with no bubble trail in the chamber.',
      },
    },
    steps: [
      {
        n: '01',
        t: 'Move the primary container off acrylic',
        d: [
          'Acrylic looks right on a desk and gives way under air freight. All key components moved to PETG: clearer, far higher impact resistance, and a thread that survives a full production run.',
          'The wall was rebuilt as a lighter, more durable profile, which took 12% off shipping weight without changing the silhouette.',
        ],
      },
      {
        n: '02',
        t: 'Rebuild the presentation box as a structure',
        d: [
          'The old box had no rigidity and quietly undercut the price point. The replacement used FSC-certified board at 1,200 gsm, with a liner cut to the bottle layout so nothing shifted in transit, finished in a soft-touch matte.',
        ],
      },
      {
        n: '03',
        t: 'Put a Number on Each Batch',
        d: [
          'Incoming board and components gauged before they reached the line. A pilot assembly review tested the closure against the capping machine’s real torque limits. An AQL 2.5 sampling plan was locked for each production lot before the first one ran.',
        ],
      },
      {
        n: '04',
        t: 'Prove the seal, not the look',
        d: [
          'Metallic pump components ran 96 hours of salt spray to ASTM B117, so gold finishes hold in a humid bathroom. Finished jars then held vacuum at −0.06 MPa for exactly three minutes across fifty randomly sampled units — the test that catches a gap a visual check passes.',
        ],
      },
    ],
    sequence: {
      label: 'The Gated Sequence',
      heading: 'Five Gates, Each With a Release Condition',
      items: [
        {
          when: 'Gate 1',
          t: 'Diagnose on the line',
          d: 'Released only once the fault reproduced under machine torque, not in a single hand-capped sample.',
          releasedBy: 'QC inspector',
        },
        {
          when: 'Gate 2',
          t: 'Re-spec the structure',
          d: 'Released when the redrawn wall hit its weight target without losing the rigid feel the price point depends on.',
        },
        {
          when: 'Gate 3',
          t: 'Rebuild the secondary',
          d: 'Released when the liner sat the bottles with no movement under shake, and the printed sheet held the colour target.',
          releasedBy: 'Interior fitment',
        },
        {
          when: 'Gate 4',
          t: 'Verify under load',
          d: 'Released on instrument readings alone — every figure signed off had come off a gauge, never an opinion.',
          releasedBy: 'Leak and pressure testing',
        },
        {
          when: 'Gate 5',
          t: 'Ship and re-measure',
          d: 'Released to the brand only after the arrival data matched the factory data, unit for unit.',
          releasedBy: 'Operations manager',
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
          'Customers immediately praised the premium weight and feel of the rigid box. We saw a complete drop in ' +
          'damage claims. The new architecture did not just fix our leak problem — it elevated the perceived value ' +
          'and supported a higher retail price point.',
        name: 'Operations Director',
        role: 'Wildsmith Skin',
      },
    ],
    intro:
      'The headline claim is 0% leakage across 50,000 units. The table below is the whole of it — what moved, and the instrument behind each figure.',
    rows: [
      {
        metric: 'Transit leakage',
        before: '15% projected',
        after: '0% measured',
        how: 'Fulfillment logs; closure torque re-measured on arrival',
      },
      {
        metric: 'Neck thread',
        before: 'Micro-fracture at 10 closures',
        after: 'Intact across the run',
        how: 'Digital calipers on thread pitch and closure fit',
      },
      {
        metric: 'Metallic pump finish',
        before: 'Not tested',
        after: 'No oxidation',
        how: '96-hour salt spray, ASTM B117',
      },
      {
        metric: 'Shipment inspection',
        before: 'Visual check',
        after: 'AQL 2.5 sampling',
        how: 'Pre-shipment sampling plan, every lot',
      },
      {
        metric: 'Shipping weight',
        before: 'Baseline',
        after: '−12%',
        how: 'Lighter wall structure, same silhouette',
      },
    ],
    attribution:
      'The operations team tracked exactly 50,000 units from the Shenzhen assembly floor to the Western ' +
      'distribution center, and closure torque was re-measured with a digital meter on arrival. The finished ' +
      'system passed ISTA 3A transit testing, and the raw fulfillment logs were audited against the claim ' +
      'before this page was written.',
  },

  demand: {
    label: '04 · What to Demand Next Time',
    heading: 'Four Questions Worth Asking Before You Scale',
    notes: [
      {
        text:
          'A rigid box is not packaging around a product; it is the first physical evidence of what the product ' +
          'costs. Which is why a box that flexes in the hand undoes the price on the label.',
        name: 'Evelio Mattos',
        role: 'Host, Packaging Unboxd',
        linkedin: 'https://www.linkedin.com/in/eveliomattos',
      },
    ],
    intro:
      'None of this is specific to skincare. Any buyer approving a container in China can ask the same four things, and each one is cheap to ask before tooling and expensive to ask after.',
    items: [
      {
        n: '01',
        t: 'Approve the mechanics, not the prototype',
        d: [
          'A sample signed off in a meeting room has never been through a capping machine. Name the torque figure the closure must reach, and ask for it demonstrated before tooling is paid for.',
        ],
      },
      {
        n: '02',
        t: 'Set the pass/fail before the first lot',
        d: [
          'Name the AQL level, the sampling plan and the measuring instrument in the supplier agreement. Vague quality language is what lets a defect reach a customer with every inspection signed off.',
        ],
      },
      {
        n: '03',
        t: 'Treat a material upgrade as a margin decision',
        d: [
          'PETG cost more per unit. It also ended the replacement shipments, and a 12% drop in replacement waste paid the difference back. Price the failure, not just the piece.',
        ],
      },
      {
        n: '04',
        t: 'Read raw defect data, not a summary',
        d: [
          'Ask for the inspection records rather than a certificate. The figure that matters is the one on the caliper, and it should come from your supplier’s own paperwork.',
        ],
      },
    ],
  },

  cta: {
    heading: 'Have a Leak, a Claim Rate, or a Crushed Corner',
    body:
      'Send us the failure you are trying to move. The reply names what to change first, and what leaving it ' +
      'alone would have cost.',
  },

  related: ['apparel-packaging-case-study', 'jewelry-packaging-case-study', 'food-packaging-case-study'],
};
