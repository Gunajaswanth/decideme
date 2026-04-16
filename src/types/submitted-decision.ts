/**
 * A decision submitted from the Ask flow, stored in client-side app state.
 */
export type SubmittedDecisionReason = {
  id: string;
  optionIndex: number;
  text: string;
  createdAt: string;
  /** Community upvotes on this reason (persisted with the decision). */
  upvotes: number;
};

export type SubmittedDecision = {
  id: string;
  question: string;
  /** Non-empty option labels in order (typically 2–4). */
  options: string[];
  /** Vote totals per option; same length as `options`. */
  voteCounts: number[];
  /** Local community reasons tied to a voted option. */
  reasons: SubmittedDecisionReason[];
  /** User-selected category, or empty string if none. */
  category: string;
  /** Optional background context; may be empty. */
  context: string;
  anonymous: boolean;
  /** ISO 8601 timestamp. */
  createdAt: string;
};

export type SubmittedDecisionInput = Omit<
  SubmittedDecision,
  "id" | "createdAt" | "voteCounts" | "reasons"
>;

/** Fields that can be saved from the detail-page editor. */
export type SubmittedDecisionUpdatePayload = {
  question: string;
  category: string;
  context: string;
  anonymous: boolean;
  /**
   * When the decision has zero total votes, replaces options (min 2 non-empty).
   * Ignored when any votes exist.
   */
  options?: string[];
};
