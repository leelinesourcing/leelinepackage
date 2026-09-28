import type { CaseStudy } from './types';
import { skincarePackagingCaseStudy } from './skincare-packaging-case-study';
import { jewelryPackagingCaseStudy } from './jewelry-packaging-case-study';
import { apparelPackagingCaseStudy } from './apparel-packaging-case-study';
import { foodPackagingCaseStudy } from './food-packaging-case-study';
import { dieCutWindowsCaseStudy } from './custom-die-cut-windows-case-study';
import { kitchenwareLaunchCaseStudy } from './kitchenware-launch-case-study';
import { recycledCorrugatedCaseStudy } from './recycled-corrugated-packaging';

export type { CaseStudy } from './types';

/*
  The registry of hand-authored case-study article pages, keyed by the blog post's id.

  ⚠️ A slug with no entry here is NOT an error. `src/pages/[slug].astro` falls back to the
  shared blog article layout, so a `csae-study` post that nobody has written a page for still
  renders at its own URL — it just looks like an article rather than a case study. Add an
  entry to promote it.

  All seven `csae-study` posts are written as of 2026-09-28.
*/
export const CASE_STUDIES: Record<string, CaseStudy> = {
  [skincarePackagingCaseStudy.slug]: skincarePackagingCaseStudy,
  [jewelryPackagingCaseStudy.slug]: jewelryPackagingCaseStudy,
  [apparelPackagingCaseStudy.slug]: apparelPackagingCaseStudy,
  [foodPackagingCaseStudy.slug]: foodPackagingCaseStudy,
  [dieCutWindowsCaseStudy.slug]: dieCutWindowsCaseStudy,
  [kitchenwareLaunchCaseStudy.slug]: kitchenwareLaunchCaseStudy,
  [recycledCorrugatedCaseStudy.slug]: recycledCorrugatedCaseStudy,
};

/** Look up the hand-authored page for a post id, if there is one. */
export const getCaseStudy = (slug: string): CaseStudy | undefined => CASE_STUDIES[slug];
