/** localStorage: Record<submittedDecisionId, selectedOptionIndex> */
export const COMMUNITY_VOTE_CHOICES_STORAGE_KEY = "decideme_community_vote_choices";

function sanitizeVoteChoicesRecord(raw: unknown): Record<string, number> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || k.length === 0) continue;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    const idx = Math.floor(v);
    if (idx < 0 || idx > 64) continue;
    out[k] = idx;
  }
  return out;
}

export function readCommunityVoteChoicesFromStorage(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(COMMUNITY_VOTE_CHOICES_STORAGE_KEY);
    if (raw == null || raw === "") return {};
    const data: unknown = JSON.parse(raw);
    return sanitizeVoteChoicesRecord(data);
  } catch {
    return {};
  }
}

export function writeCommunityVoteChoicesToStorage(
  choices: Record<string, number>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      COMMUNITY_VOTE_CHOICES_STORAGE_KEY,
      JSON.stringify(choices),
    );
  } catch {
    /* ignore */
  }
}
