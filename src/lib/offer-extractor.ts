/**
 * Extract offers / discounts / free items mentioned in real guest review text.
 * Never invents offers – only surfaces what guests actually wrote.
 * Confidence: High | Medium | Low
 */

export type OfferConfidence = "High" | "Medium" | "Low";

export interface ExtractedOffer {
  text: string;
  confidence: OfferConfidence;
  sourceAuthor?: string;
}

const HIGH_PATTERNS: RegExp[] = [
  /\bfree\s+[\w\s]{2,30}/gi,
  /\b\d{1,2}\s*%\s*discount\b/gi,
  /\bdiscount\s+code\b/gi,
  /\bcomplimentary\s+[\w\s]{2,25}/gi,
  /\bupgrade\b/gi,
  /\bfree\s+canoe\b/gi,
  /\bfree\s+kayak\b/gi,
  /تخفیف\s*\d{1,2}\s*%/gi,
  /رایگان/gi,
  /آفر\s+رایگان/gi,
];

const MEDIUM_PATTERNS: RegExp[] = [
  /\bdiscount\b/gi,
  /\boffer\b/gi,
  /\bspecial\s+deal\b/gi,
  /\bpromo\b/gi,
  /تخفیف/gi,
  /آفر/gi,
];

/**
 * Scan a single review comment and return any offer-like phrases found.
 */
export function extractOffersFromComment(
  comment: string,
  author?: string,
): ExtractedOffer[] {
  if (!comment?.trim()) return [];

  const found: ExtractedOffer[] = [];
  const seen = new Set<string>();

  for (const pattern of HIGH_PATTERNS) {
    const matches = comment.match(pattern);
    if (matches) {
      for (const m of matches) {
        const key = m.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          found.push({
            text: m.trim(),
            confidence: "High",
            sourceAuthor: author,
          });
        }
      }
    }
  }

  for (const pattern of MEDIUM_PATTERNS) {
    const matches = comment.match(pattern);
    if (matches) {
      for (const m of matches) {
        const key = m.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          found.push({
            text: m.trim(),
            confidence: "Medium",
            sourceAuthor: author,
          });
        }
      }
    }
  }

  return found;
}

/**
 * Aggregate offers from an array of reviews (static or from Supabase).
 */
export function extractOffersFromReviews(
  reviews: { comment: string; author?: string; user_name?: string }[],
): ExtractedOffer[] {
  const all: ExtractedOffer[] = [];
  const seen = new Set<string>();

  for (const r of reviews) {
    const author = r.author ?? r.user_name;
    const offers = extractOffersFromComment(r.comment, author);
    for (const o of offers) {
      const key = o.text.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(o);
      }
    }
  }

  // Prefer High confidence first
  return all.sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}
