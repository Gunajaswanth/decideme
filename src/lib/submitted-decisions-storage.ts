import type {
  SubmittedDecision,
  SubmittedDecisionReason,
} from "@/types/submitted-decision";

export const SUBMITTED_DECISIONS_STORAGE_KEY = "decideme_submitted_decisions";

function sanitizeVoteCountCell(c: unknown): number {
  if (typeof c === "number" && Number.isFinite(c) && c >= 0) return Math.floor(c);
  return 0;
}

/**
 * Ensures `voteCounts` exists, matches `options.length`, and contains safe
 * non-negative integers. Legacy stored rows without `voteCounts`, with `null`,
 * wrong length, or partial arrays are repaired without discarding valid counts.
 */
export function normalizeSubmittedVoteCounts(d: SubmittedDecision): SubmittedDecision {
  const n = d.options.length;
  const raw = d.voteCounts;

  if (!Array.isArray(raw)) {
    return { ...d, voteCounts: Array.from({ length: n }, () => 0) };
  }

  if (raw.length === n) {
    return {
      ...d,
      voteCounts: raw.map((c) => sanitizeVoteCountCell(c)),
    };
  }

  if (raw.length < n) {
    const head = raw.map((c) => sanitizeVoteCountCell(c));
    const pad = Array.from({ length: n - raw.length }, () => 0);
    return { ...d, voteCounts: [...head, ...pad] };
  }

  return {
    ...d,
    voteCounts: raw.slice(0, n).map((c) => sanitizeVoteCountCell(c)),
  };
}

function sanitizeReasonUpvoteCount(u: unknown): number {
  if (typeof u !== "number" || !Number.isFinite(u) || u < 0) return 0;
  return Math.floor(u);
}

function parseReasonEntry(r: unknown): SubmittedDecisionReason | null {
  if (typeof r !== "object" || r === null) return null;
  const o = r as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.length === 0) return null;
  if (typeof o.optionIndex !== "number" || !Number.isFinite(o.optionIndex)) {
    return null;
  }
  if (typeof o.text !== "string") return null;
  if (typeof o.createdAt !== "string" || o.createdAt.length === 0) return null;
  const upvotes = sanitizeReasonUpvoteCount(o.upvotes);
  return {
    id: o.id,
    optionIndex: Math.floor(o.optionIndex),
    text: o.text,
    createdAt: o.createdAt,
    upvotes,
  };
}

export function normalizeSubmittedReasons(d: SubmittedDecision): SubmittedDecision {
  const n = d.options.length;
  const raw = d.reasons;
  if (!Array.isArray(raw)) {
    return { ...d, reasons: [] };
  }
  const reasons: SubmittedDecisionReason[] = [];
  for (const item of raw) {
    const row = parseReasonEntry(item);
    if (!row) continue;
    if (row.optionIndex < 0 || row.optionIndex >= n) continue;
    reasons.push(row);
  }
  return { ...d, reasons };
}

export function normalizeSubmittedDecision(d: SubmittedDecision): SubmittedDecision {
  return normalizeSubmittedReasons(normalizeSubmittedVoteCounts(d));
}

function parseSubmittedDecisionItem(item: unknown): SubmittedDecision | null {
  if (typeof item !== "object" || item === null) return null;
  const o = item as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    o.id.length === 0 ||
    typeof o.question !== "string" ||
    !Array.isArray(o.options) ||
    !o.options.every((x) => typeof x === "string") ||
    typeof o.createdAt !== "string" ||
    o.createdAt.length === 0
  ) {
    return null;
  }

  const category = typeof o.category === "string" ? o.category : "";
  const context = typeof o.context === "string" ? o.context : "";
  const anonymous = typeof o.anonymous === "boolean" ? o.anonymous : true;

  let voteCounts: unknown[] = [];
  if (o.voteCounts === undefined || o.voteCounts === null) {
    voteCounts = [];
  } else if (Array.isArray(o.voteCounts)) {
    voteCounts = o.voteCounts;
  }

  const reasonsRaw = Array.isArray(o.reasons) ? o.reasons : [];

  const base: SubmittedDecision = {
    id: o.id,
    question: o.question,
    options: o.options as string[],
    voteCounts: voteCounts as number[],
    reasons: reasonsRaw as SubmittedDecisionReason[],
    category,
    context,
    anonymous,
    createdAt: o.createdAt,
  };
  return normalizeSubmittedDecision(base);
}

/**
 * Parses localStorage JSON. Returns only well-formed items; skips invalid entries.
 * Returns [] for missing key, parse errors, or non-array root.
 */
export function parseSubmittedDecisionsFromJson(raw: string): SubmittedDecision[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: SubmittedDecision[] = [];
  for (const item of data) {
    const row = parseSubmittedDecisionItem(item);
    if (row) out.push(row);
  }
  return out;
}

export function readSubmittedDecisionsFromStorage(): SubmittedDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBMITTED_DECISIONS_STORAGE_KEY);
    if (raw == null || raw === "") return [];
    return parseSubmittedDecisionsFromJson(raw);
  } catch {
    return [];
  }
}

export function writeSubmittedDecisionsToStorage(
  decisions: SubmittedDecision[],
): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = decisions.map(normalizeSubmittedDecision);
    window.localStorage.setItem(
      SUBMITTED_DECISIONS_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    /* QuotaExceededError, private mode, etc. */
  }
}
