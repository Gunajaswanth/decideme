/**
 * localStorage: which reason ids this browser has upvoted (one upvote per reason).
 * Keys are reason ids; values are true.
 */
export const REASON_UPVOTE_CHOICES_STORAGE_KEY = "decideme_reason_upvote_choices";

function sanitizeReasonUpvoteRecord(raw: unknown): Record<string, boolean> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || k.length === 0) continue;
    if (v === true || v === 1) out[k] = true;
  }
  return out;
}

export function readReasonUpvoteChoicesFromStorage(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REASON_UPVOTE_CHOICES_STORAGE_KEY);
    if (raw == null || raw === "") return {};
    const data: unknown = JSON.parse(raw);
    return sanitizeReasonUpvoteRecord(data);
  } catch {
    return {};
  }
}

export function writeReasonUpvoteChoicesToStorage(
  choices: Record<string, boolean>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      REASON_UPVOTE_CHOICES_STORAGE_KEY,
      JSON.stringify(choices),
    );
  } catch {
    /* ignore */
  }
}
