/**
 * INFLUNEX PROGRAMMATIC SEO INDEX QUALITY GATE
 * Prevents thin, empty, or near-duplicate programmatic pages from being indexed or added to sitemaps.
 * Default threshold: Minimum 3 active & APPROVED creator profiles with real service data,
 * unless an explicit editorial override is granted for high-value unique pages.
 */

export const MIN_APPROVED_CREATORS_FOR_INDEX = 3;
export const MIN_UNIQUE_DESCRIPTION_CHARS = 120;

export interface QualityGateInput {
  path: string;
  approvedCreatorCount: number;
  activeServiceCount: number;
  uniqueDescriptionText: string;
  isDuplicateContent?: boolean;
  httpStatus?: number;
  isInternallyLinked?: boolean;
  editorialOverride?: boolean;
}

export interface QualityGateEvaluation {
  path: string;
  indexable: boolean;
  includeInSitemap: boolean;
  robotsDirective: "index, follow" | "noindex, follow";
  qualityScore: number;
  reasons: string[];
}

export function evaluateIndexQualityGate(
  input: QualityGateInput
): QualityGateEvaluation {
  const reasons: string[] = [];
  const httpStatus = input.httpStatus ?? 200;
  const isInternallyLinked = input.isInternallyLinked ?? true;
  const isDuplicate = input.isDuplicateContent ?? false;
  const descLength = input.uniqueDescriptionText.trim().length;

  if (httpStatus !== 200) {
    reasons.push(`HTTP_STATUS_${httpStatus}`);
  }

  if (isDuplicate) {
    reasons.push("DUPLICATE_OR_NEAR_DUPLICATE_CONTENT");
  }

  if (!isInternallyLinked) {
    reasons.push("ORPHAN_PAGE_NO_INTERNAL_LINKS");
  }

  if (descLength < MIN_UNIQUE_DESCRIPTION_CHARS) {
    reasons.push("DESCRIPTION_TOO_SHORT");
  }

  if (input.activeServiceCount < 1 && !input.editorialOverride) {
    reasons.push("NO_ACTIVE_SERVICE_DATA");
  }

  if (
    input.approvedCreatorCount < MIN_APPROVED_CREATORS_FOR_INDEX &&
    !input.editorialOverride
  ) {
    reasons.push(
      `BELOW_CREATOR_THRESHOLD_${input.approvedCreatorCount}_OF_${MIN_APPROVED_CREATORS_FOR_INDEX}`
    );
  }

  const indexable = reasons.length === 0;

  let qualityScore = 0;
  if (httpStatus === 200) qualityScore += 20;
  if (!isDuplicate) qualityScore += 20;
  if (isInternallyLinked) qualityScore += 15;
  if (descLength >= MIN_UNIQUE_DESCRIPTION_CHARS) qualityScore += 15;
  qualityScore += Math.min(input.approvedCreatorCount * 8, 20);
  qualityScore += Math.min(input.activeServiceCount * 2, 10);

  return {
    path: input.path,
    indexable,
    includeInSitemap: indexable,
    robotsDirective: indexable ? "index, follow" : "noindex, follow",
    qualityScore: Math.min(qualityScore, 100),
    reasons,
  };
}
