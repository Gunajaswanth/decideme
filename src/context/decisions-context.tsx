"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  readCommunityVoteChoicesFromStorage,
  writeCommunityVoteChoicesToStorage,
} from "@/lib/community-vote-choices-storage";
import {
  readReasonUpvoteChoicesFromStorage,
  writeReasonUpvoteChoicesToStorage,
} from "@/lib/reason-upvote-choices-storage";
import {
  normalizeSubmittedDecision,
  readSubmittedDecisionsFromStorage,
  writeSubmittedDecisionsToStorage,
} from "@/lib/submitted-decisions-storage";
import type {
  SubmittedDecision,
  SubmittedDecisionInput,
  SubmittedDecisionReason,
  SubmittedDecisionUpdatePayload,
} from "@/types/submitted-decision";

type DecisionsContextValue = {
  submittedDecisions: SubmittedDecision[];
  addSubmittedDecision: (input: SubmittedDecisionInput) => void;
  hasHydratedFromStorage: boolean;
  userCommunityVoteById: Record<string, number>;
  updateSubmittedDecisionVote: (
    decisionId: string,
    selectedOptionIndex: number,
  ) => void;
  addSubmittedDecisionReason: (decisionId: string, text: string) => void;
  userReasonUpvoteById: Record<string, boolean>;
  upvoteSubmittedDecisionReason: (
    decisionId: string,
    reasonId: string,
  ) => void;
  updateSubmittedDecision: (
    decisionId: string,
    payload: SubmittedDecisionUpdatePayload,
  ) => void;
  deleteSubmittedDecision: (decisionId: string) => void;
};

const DecisionsContext = createContext<DecisionsContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `dm-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function DecisionsProvider({ children }: { children: ReactNode }) {
  const [submittedDecisions, setSubmittedDecisions] = useState<SubmittedDecision[]>(
    [],
  );
  const [userCommunityVoteById, setUserCommunityVoteById] = useState<
    Record<string, number>
  >({});
  const [userReasonUpvoteById, setUserReasonUpvoteById] = useState<
    Record<string, boolean>
  >({});
  const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);
  const submittedDecisionsRef = useRef(submittedDecisions);
  const userCommunityVoteByIdRef = useRef(userCommunityVoteById);
  const userReasonUpvoteByIdRef = useRef(userReasonUpvoteById);

  useEffect(() => {
    submittedDecisionsRef.current = submittedDecisions;
  }, [submittedDecisions]);

  useEffect(() => {
    userCommunityVoteByIdRef.current = userCommunityVoteById;
  }, [userCommunityVoteById]);

  useEffect(() => {
    userReasonUpvoteByIdRef.current = userReasonUpvoteById;
  }, [userReasonUpvoteById]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const loaded = readSubmittedDecisionsFromStorage().map(
        normalizeSubmittedDecision,
      );
      setSubmittedDecisions((prev) => {
        const normalizedPrev = prev.map(normalizeSubmittedDecision);
        if (normalizedPrev.length === 0) return loaded;
        const loadedIds = new Set(loaded.map((d) => d.id));
        const optimistic = normalizedPrev.filter((d) => !loadedIds.has(d.id));
        return [...optimistic, ...loaded];
      });
      setUserCommunityVoteById(readCommunityVoteChoicesFromStorage());
      setUserReasonUpvoteById(readReasonUpvoteChoicesFromStorage());
      setHasHydratedFromStorage(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;
    writeSubmittedDecisionsToStorage(submittedDecisions);
  }, [submittedDecisions, hasHydratedFromStorage]);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;
    writeCommunityVoteChoicesToStorage(userCommunityVoteById);
  }, [userCommunityVoteById, hasHydratedFromStorage]);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;
    writeReasonUpvoteChoicesToStorage(userReasonUpvoteById);
  }, [userReasonUpvoteById, hasHydratedFromStorage]);

  const addSubmittedDecision = useCallback((input: SubmittedDecisionInput) => {
    const row: SubmittedDecision = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
      voteCounts: input.options.map(() => 0),
      reasons: [],
    };
    setSubmittedDecisions((prev) => [row, ...prev]);
  }, []);

  const addSubmittedDecisionReason = useCallback((decisionId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const voteIdx = userCommunityVoteByIdRef.current[decisionId];
    if (voteIdx === undefined) return;

    const entry: SubmittedDecisionReason = {
      id: newId(),
      optionIndex: voteIdx,
      text: trimmed.slice(0, 2000),
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    setSubmittedDecisions((prev) =>
      prev.map((d) => {
        if (d.id !== decisionId) return d;
        const dn = normalizeSubmittedDecision(d);
        if (voteIdx < 0 || voteIdx >= dn.options.length) return dn;
        return { ...dn, reasons: [...dn.reasons, entry] };
      }),
    );
  }, []);

  const updateSubmittedDecisionVote = useCallback(
    (decisionId: string, selectedOptionIndex: number) => {
      if (typeof window === "undefined") return;
      const locked = readCommunityVoteChoicesFromStorage();
      if (locked[decisionId] !== undefined) return;
      if (userCommunityVoteByIdRef.current[decisionId] !== undefined) return;

      const target = submittedDecisionsRef.current.find((d) => d.id === decisionId);
      if (!target) return;
      const dNorm = normalizeSubmittedDecision(target);
      if (
        selectedOptionIndex < 0 ||
        selectedOptionIndex >= dNorm.options.length
      ) {
        return;
      }

      const nextLocked = { ...locked, [decisionId]: selectedOptionIndex };
      writeCommunityVoteChoicesToStorage(nextLocked);
      setUserCommunityVoteById((p) => ({ ...p, [decisionId]: selectedOptionIndex }));

      setSubmittedDecisions((prev) =>
        prev.map((d) => {
          if (d.id !== decisionId) return d;
          const dn = normalizeSubmittedDecision(d);
          if (
            selectedOptionIndex < 0 ||
            selectedOptionIndex >= dn.options.length
          ) {
            return dn;
          }
          const voteCounts = [...dn.voteCounts];
          voteCounts[selectedOptionIndex] += 1;
          return { ...dn, voteCounts };
        }),
      );
    },
    [],
  );

  const updateSubmittedDecision = useCallback(
    (decisionId: string, payload: SubmittedDecisionUpdatePayload) => {
      setSubmittedDecisions((prev) => {
        const idx = prev.findIndex((d) => d.id === decisionId);
        if (idx === -1) return prev;
        const current = normalizeSubmittedDecision(prev[idx]);
        const totalVotes = current.voteCounts.reduce((a, b) => a + b, 0);

        const base = {
          ...current,
          question: payload.question.trim(),
          category: typeof payload.category === "string" ? payload.category.trim() : "",
          context: typeof payload.context === "string" ? payload.context.trim() : "",
          anonymous: payload.anonymous,
        };

        let merged: SubmittedDecision;
        if (totalVotes === 0 && Array.isArray(payload.options)) {
          const opts = payload.options
            .map((s) => (typeof s === "string" ? s.trim() : ""))
            .filter((s) => s.length > 0);
          if (opts.length < 2) return prev;
          merged = {
            ...base,
            options: opts,
            voteCounts: opts.map(() => 0),
            reasons: current.reasons.filter(
              (r) => r.optionIndex >= 0 && r.optionIndex < opts.length,
            ),
          };
        } else {
          merged = {
            ...base,
            options: [...current.options],
            voteCounts: [...current.voteCounts],
            reasons: current.reasons.map((r) => ({ ...r })),
          };
        }

        const next = [...prev];
        next[idx] = normalizeSubmittedDecision(merged);
        return next;
      });
    },
    [],
  );

  const deleteSubmittedDecision = useCallback((decisionId: string) => {
    if (typeof window === "undefined") return;
    const target = submittedDecisionsRef.current.find((d) => d.id === decisionId);
    const reasonIds = target
      ? normalizeSubmittedDecision(target).reasons.map((r) => r.id)
      : [];

    const cv = { ...readCommunityVoteChoicesFromStorage() };
    delete cv[decisionId];
    writeCommunityVoteChoicesToStorage(cv);

    const rv = { ...readReasonUpvoteChoicesFromStorage() };
    for (const rid of reasonIds) delete rv[rid];
    writeReasonUpvoteChoicesToStorage(rv);

    setSubmittedDecisions((prev) => prev.filter((d) => d.id !== decisionId));
    setUserCommunityVoteById((p) => {
      if (p[decisionId] === undefined) return p;
      const n = { ...p };
      delete n[decisionId];
      return n;
    });
    setUserReasonUpvoteById((p) => {
      let changed = false;
      const n = { ...p };
      for (const rid of reasonIds) {
        if (n[rid]) {
          delete n[rid];
          changed = true;
        }
      }
      return changed ? n : p;
    });
  }, []);

  const upvoteSubmittedDecisionReason = useCallback(
    (decisionId: string, reasonId: string) => {
      if (typeof window === "undefined") return;
      const locked = readReasonUpvoteChoicesFromStorage();
      if (locked[reasonId]) return;
      if (userReasonUpvoteByIdRef.current[reasonId]) return;

      const target = submittedDecisionsRef.current.find((d) => d.id === decisionId);
      if (!target) return;
      const dn = normalizeSubmittedDecision(target);
      const reason = dn.reasons.find((r) => r.id === reasonId);
      if (!reason) return;

      const nextLocked = { ...locked, [reasonId]: true };
      writeReasonUpvoteChoicesToStorage(nextLocked);
      setUserReasonUpvoteById((p) => ({ ...p, [reasonId]: true }));

      setSubmittedDecisions((prev) =>
        prev.map((d) => {
          if (d.id !== decisionId) return d;
          const d2 = normalizeSubmittedDecision(d);
          return {
            ...d2,
            reasons: d2.reasons.map((r) =>
              r.id === reasonId ? { ...r, upvotes: r.upvotes + 1 } : r,
            ),
          };
        }),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      submittedDecisions,
      addSubmittedDecision,
      hasHydratedFromStorage,
      userCommunityVoteById,
      updateSubmittedDecisionVote,
      addSubmittedDecisionReason,
      userReasonUpvoteById,
      upvoteSubmittedDecisionReason,
      updateSubmittedDecision,
      deleteSubmittedDecision,
    }),
    [
      submittedDecisions,
      addSubmittedDecision,
      hasHydratedFromStorage,
      userCommunityVoteById,
      updateSubmittedDecisionVote,
      addSubmittedDecisionReason,
      userReasonUpvoteById,
      upvoteSubmittedDecisionReason,
      updateSubmittedDecision,
      deleteSubmittedDecision,
    ],
  );

  return (
    <DecisionsContext.Provider value={value}>{children}</DecisionsContext.Provider>
  );
}

export function useDecisions(): DecisionsContextValue {
  const ctx = useContext(DecisionsContext);
  if (!ctx) {
    throw new Error("useDecisions must be used within a DecisionsProvider");
  }
  return ctx;
}
