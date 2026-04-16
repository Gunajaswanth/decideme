"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Share2, ThumbsUp, Trash2 } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";

import type { SubmittedDecisionReason } from "@/types/submitted-decision";

import { ResultsBars } from "@/components/voting/ResultsBars";
import { TotalVotes } from "@/components/voting/TotalVotes";
import { VoteButtons } from "@/components/voting/VoteButtons";
import { useDecisions } from "@/context/decisions-context";
import { useDecisionShare } from "@/hooks/use-decision-share";
import {
  BTN_COMPACT,
  BTN_DISABLED,
  BTN_PRIMARY,
  BTN_SECONDARY,
} from "@/lib/product-ui";

const EDIT_CATEGORIES = [
  "Career",
  "Money",
  "Tech",
  "Education",
  "Lifestyle",
] as const;

type EditTouched = {
  question: boolean;
  o1: boolean;
  o2: boolean;
};

const initialEditTouched: EditTouched = {
  question: false,
  o1: false,
  o2: false,
};

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function formatReasonAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const REASON_FIELD_CLASS =
  "mt-2 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500 dark:focus:ring-violet-400/25";

const FIELD_CLASS =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500 dark:focus:bg-zinc-900 dark:focus:ring-violet-400/25";

const LABEL_CLASS = "text-sm font-semibold text-zinc-800 dark:text-zinc-100";
const HELPER_CLASS = "mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400";
const ERROR_CLASS = "mt-1.5 text-xs font-medium text-red-600 dark:text-red-400";

export default function DecisionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const {
    submittedDecisions,
    hasHydratedFromStorage,
    userCommunityVoteById,
    updateSubmittedDecisionVote,
    addSubmittedDecisionReason,
    userReasonUpvoteById,
    upvoteSubmittedDecisionReason,
    updateSubmittedDecision,
    deleteSubmittedDecision,
  } = useDecisions();

  const decision = useMemo(
    () => submittedDecisions.find((d) => d.id === id),
    [submittedDecisions, id],
  );

  const totalVotes = useMemo(
    () => (decision ? decision.voteCounts.reduce((a, b) => a + b, 0) : 0),
    [decision],
  );
  const canEditOptions = totalVotes === 0;

  const { shareFeedback, shareDecision } = useDecisionShare();
  const [reasonDraft, setReasonDraft] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState("");
  const [editO1, setEditO1] = useState("");
  const [editO2, setEditO2] = useState("");
  const [editO3, setEditO3] = useState("");
  const [editO4, setEditO4] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContext, setEditContext] = useState("");
  const [editAnonymous, setEditAnonymous] = useState(true);
  const [editTouched, setEditTouched] = useState<EditTouched>(initialEditTouched);

  const startEdit = useCallback(() => {
    if (!decision) return;
    setEditQuestion(decision.question);
    setEditO1(decision.options[0] ?? "");
    setEditO2(decision.options[1] ?? "");
    setEditO3(decision.options[2] ?? "");
    setEditO4(decision.options[3] ?? "");
    setEditCategory(decision.category);
    setEditContext(decision.context);
    setEditAnonymous(decision.anonymous);
    setEditTouched(initialEditTouched);
    setIsEditing(true);
  }, [decision]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditTouched(initialEditTouched);
  }, []);

  const editQOk = editQuestion.trim().length > 0;
  const editO1Ok = editO1.trim().length > 0;
  const editO2Ok = editO2.trim().length > 0;

  const editErrors = useMemo(
    () => ({
      question:
        editTouched.question && !editQOk
          ? "Add a question so voters know what they're deciding."
          : null,
      o1:
        canEditOptions && editTouched.o1 && !editO1Ok
          ? "Option 1 is required."
          : null,
      o2:
        canEditOptions && editTouched.o2 && !editO2Ok
          ? "Option 2 is required."
          : null,
    }),
    [editTouched, editQOk, editO1Ok, editO2Ok, canEditOptions],
  );

  const saveEdit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!decision) return;
      setEditTouched({ question: true, o1: true, o2: true });
      if (!editQuestion.trim()) return;
      if (canEditOptions && (!editO1.trim() || !editO2.trim())) return;

      const payload = {
        question: editQuestion.trim(),
        category: editCategory.trim(),
        context: editContext.trim(),
        anonymous: editAnonymous,
        ...(canEditOptions
          ? {
              options: [editO1, editO2, editO3, editO4]
                .map((s) => s.trim())
                .filter((s) => s.length > 0),
            }
          : {}),
      };
      updateSubmittedDecision(decision.id, payload);
      setIsEditing(false);
      setEditTouched(initialEditTouched);
    },
    [
      decision,
      editQuestion,
      editCategory,
      editContext,
      editAnonymous,
      editO1,
      editO2,
      editO3,
      editO4,
      canEditOptions,
      updateSubmittedDecision,
    ],
  );

  const handleDelete = useCallback(() => {
    if (!decision) return;
    if (
      !window.confirm(
        "Delete this decision? Votes, reasons, and local activity for it will be removed on this device.",
      )
    ) {
      return;
    }
    deleteSubmittedDecision(decision.id);
    router.push("/explore");
  }, [decision, deleteSubmittedDecision, router]);

  const reasonsByOption = useMemo(() => {
    const groups = new Map<number, SubmittedDecisionReason[]>();
    if (!decision) return groups;
    for (const r of decision.reasons) {
      const list = groups.get(r.optionIndex) ?? [];
      list.push(r);
      groups.set(r.optionIndex, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => {
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        return b.createdAt.localeCompare(a.createdAt);
      });
    }
    return groups;
  }, [decision]);

  const submitReason = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!decision) return;
      if (!reasonDraft.trim()) return;
      addSubmittedDecisionReason(decision.id, reasonDraft);
      setReasonDraft("");
    },
    [decision, reasonDraft, addSubmittedDecisionReason],
  );

  if (!hasHydratedFromStorage) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="animate-pulse rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-9 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-6 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-3 h-10 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-3 h-10 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 text-center shadow-[0_12px_40px_-16px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <span className="text-2xl font-bold" aria-hidden>
                ?
              </span>
            </div>
            <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Decision not found
            </h1>
            <p className="mt-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
              This link may be broken, or the decision was removed from this
              device. Submissions stay on this browser for now.
            </p>
            <Link href="/explore" className={`${BTN_PRIMARY} mt-6`}>
              Open Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const visibility = decision.anonymous ? "Anonymous" : "Public";
  const userVoteIndex = userCommunityVoteById[decision.id];
  const hasVoted = userVoteIndex !== undefined;

  const pickOption = (optionIndex: number) => {
    if (hasVoted) return;
    updateSubmittedDecisionVote(decision.id, optionIndex);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-[400px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100/80 active:scale-[0.98] dark:text-violet-300 dark:hover:bg-violet-950/50"
          >
            <ArrowLeft className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
            Back
          </Link>
          <button
            type="button"
            onClick={() => void shareDecision(decision.id, decision.question)}
            className={BTN_COMPACT}
          >
            <Share2 className="size-4 shrink-0 text-violet-600 dark:text-violet-400" strokeWidth={2} aria-hidden />
            Share
          </button>
        </div>

        {!isEditing ? (
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startEdit}
              className={`${BTN_COMPACT} flex-1 min-w-[40%] justify-center sm:flex-initial`}
            >
              <Pencil className="size-4 shrink-0 text-violet-600 dark:text-violet-400" strokeWidth={2} aria-hidden />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex flex-1 min-w-[40%] items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 active:scale-[0.98] dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/30 sm:flex-initial"
            >
              <Trash2 className="size-4 shrink-0" strokeWidth={2} aria-hidden />
              Delete
            </button>
          </div>
        ) : null}

        {shareFeedback ? (
          <p
            className="mb-3 rounded-xl bg-emerald-100 px-3 py-2 text-center text-xs font-medium text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200"
            role="status"
            aria-live="polite"
          >
            {shareFeedback}
          </p>
        ) : null}

        {isEditing ? (
          <form
            onSubmit={saveEdit}
            className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]"
            noValidate
          >
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Edit decision
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Changes save to this device only.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="edit-question" className={LABEL_CLASS}>
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-question"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  onBlur={() => setEditTouched((t) => ({ ...t, question: true }))}
                  rows={3}
                  className={`${FIELD_CLASS} mt-2 min-h-[5.5rem] resize-y`}
                  aria-invalid={!!editErrors.question}
                />
                {editErrors.question ? (
                  <p className={ERROR_CLASS} role="alert">
                    {editErrors.question}
                  </p>
                ) : null}
              </div>

              {canEditOptions ? (
                <>
                  <div>
                    <label htmlFor="edit-o1" className={LABEL_CLASS}>
                      Option 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-o1"
                      type="text"
                      value={editO1}
                      onChange={(e) => setEditO1(e.target.value)}
                      onBlur={() => setEditTouched((t) => ({ ...t, o1: true }))}
                      className={`${FIELD_CLASS} mt-2`}
                      autoComplete="off"
                    />
                    {editErrors.o1 ? (
                      <p className={ERROR_CLASS} role="alert">
                        {editErrors.o1}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="edit-o2" className={LABEL_CLASS}>
                      Option 2 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit-o2"
                      type="text"
                      value={editO2}
                      onChange={(e) => setEditO2(e.target.value)}
                      onBlur={() => setEditTouched((t) => ({ ...t, o2: true }))}
                      className={`${FIELD_CLASS} mt-2`}
                      autoComplete="off"
                    />
                    {editErrors.o2 ? (
                      <p className={ERROR_CLASS} role="alert">
                        {editErrors.o2}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="edit-o3" className={LABEL_CLASS}>
                      Option 3{" "}
                      <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
                    <input
                      id="edit-o3"
                      type="text"
                      value={editO3}
                      onChange={(e) => setEditO3(e.target.value)}
                      className={`${FIELD_CLASS} mt-2`}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-o4" className={LABEL_CLASS}>
                      Option 4{" "}
                      <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
                    <input
                      id="edit-o4"
                      type="text"
                      value={editO4}
                      onChange={(e) => setEditO4(e.target.value)}
                      className={`${FIELD_CLASS} mt-2`}
                      autoComplete="off"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
                  <p className={LABEL_CLASS}>Options</p>
                  <p className={`${HELPER_CLASS} mt-1`}>
                    Options stay fixed once someone has voted so results and reasons
                    stay aligned.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {decision.options.map((opt, i) => (
                      <li
                        key={`edit-lock-${decision.id}-${i}`}
                        className="rounded-xl border border-zinc-200/90 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
                      >
                        {i + 1}. {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label htmlFor="edit-category" className={LABEL_CLASS}>
                  Category
                </label>
                <select
                  id="edit-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className={`${FIELD_CLASS} mt-2 cursor-pointer`}
                >
                  <option value="">Uncategorized</option>
                  {EDIT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-context" className={LABEL_CLASS}>
                  Context{" "}
                  <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <textarea
                  id="edit-context"
                  value={editContext}
                  onChange={(e) => setEditContext(e.target.value)}
                  rows={3}
                  className={`${FIELD_CLASS} mt-2 min-h-[5rem] resize-y`}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="min-w-0">
                  <p className={`${LABEL_CLASS} text-sm`}>Post anonymously</p>
                  <p className={`${HELPER_CLASS} mt-0.5`}>
                    Shows as Anonymous on cards and detail.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editAnonymous}
                  onClick={() => setEditAnonymous((a) => !a)}
                  className={`relative inline-flex h-8 w-[3.25rem] shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                    editAnonymous
                      ? "bg-violet-600 dark:bg-violet-500"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute top-1/2 size-7 -translate-y-1/2 rounded-full bg-white shadow-md transition-[left] duration-200 ease-out ${
                      editAnonymous ? "left-[calc(100%-1.75rem-0.125rem)]" : "left-0.5"
                    }`}
                  />
                  <span className="sr-only">
                    {editAnonymous ? "Anonymous on" : "Anonymous off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className={`${BTN_SECONDARY} sm:order-1 sm:w-auto`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${BTN_PRIMARY} sm:order-2 sm:w-auto sm:min-w-[9rem]`}
              >
                Save changes
              </button>
            </div>
          </form>
        ) : (
          <article
            className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center gap-2">
              {decision.category ? (
                <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-950/80 dark:text-violet-200">
                  {decision.category}
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  Uncategorized
                </span>
              )}
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                Pending review
              </span>
              <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-900 dark:bg-sky-950/70 dark:text-sky-200">
                Community submission
              </span>
              <span
                className={
                  decision.anonymous
                    ? "inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    : "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
                }
              >
                {visibility}
              </span>
            </div>

            <h1 className="mt-5 text-xl font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              {decision.question}
            </h1>

            {!hasVoted ? (
              <VoteButtons
                options={decision.options}
                disabled={hasVoted}
                selectedOptionIndex={userVoteIndex}
                onVote={pickOption}
                optionKeyPrefix={decision.id}
                variant="community"
              />
            ) : (
              <div className="mt-8 space-y-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <ResultsBars
                  resultKeyPrefix={decision.id}
                  showVoteCounts
                  bars={decision.options.map((opt, i) => {
                    const count = decision.voteCounts[i] ?? 0;
                    const pct =
                      totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return {
                      label: opt,
                      percent: pct,
                      voteCount: count,
                      highlight: userVoteIndex === i,
                    };
                  })}
                />
                <TotalVotes totalVotes={totalVotes} />

                <form
                  onSubmit={submitReason}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-700 dark:bg-zinc-800/40"
                >
                  <label
                    htmlFor="community-reason"
                    className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
                  >
                    Why did you choose this?
                  </label>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Optional — a sentence helps others understand your vote. Stored
                    only on this device.
                  </p>
                  <textarea
                    id="community-reason"
                    name="reason"
                    rows={3}
                    maxLength={500}
                    value={reasonDraft}
                    onChange={(e) => setReasonDraft(e.target.value)}
                    placeholder="Share your thinking…"
                    className={`${REASON_FIELD_CLASS} min-h-[4.5rem]`}
                  />
                  <button
                    type="submit"
                    disabled={!reasonDraft.trim()}
                    className={`${BTN_PRIMARY} mt-3 ${BTN_DISABLED}`}
                  >
                    Add reason
                  </button>
                </form>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                    Community reasons
                  </h2>
                  {decision.reasons.length === 0 ? (
                    <p className="mt-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-6 text-center text-sm leading-snug text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                      No reasons yet—share yours above to kick off the thread.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-6">
                      {decision.options.map((optLabel, optIdx) => {
                        const list = reasonsByOption.get(optIdx) ?? [];
                        if (list.length === 0) return null;
                        return (
                          <div key={`${decision.id}-reasons-opt-${optIdx}`}>
                            <p className="text-xs font-semibold text-violet-800 dark:text-violet-200">
                              {optLabel}
                            </p>
                            <ul className="mt-2 space-y-2">
                              {list.map((r) => {
                                const hasUpvoted = Boolean(
                                  userReasonUpvoteById[r.id],
                                );
                                return (
                                  <li
                                    key={r.id}
                                    className="rounded-2xl border border-zinc-200/90 bg-white px-3 py-2.5 text-sm leading-relaxed text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                                  >
                                    <div className="flex gap-3">
                                      <div className="min-w-0 flex-1">
                                        <p>{r.text}</p>
                                        <span className="mt-1.5 block text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                          {formatReasonAt(r.createdAt)}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        disabled={hasUpvoted}
                                        aria-pressed={hasUpvoted}
                                        aria-label={
                                          hasUpvoted
                                            ? `Upvoted · ${r.upvotes} upvote${r.upvotes === 1 ? "" : "s"}`
                                            : `Upvote · ${r.upvotes} upvote${r.upvotes === 1 ? "" : "s"} currently`
                                        }
                                        onClick={() =>
                                          upvoteSubmittedDecisionReason(
                                            decision.id,
                                            r.id,
                                          )
                                        }
                                        className={
                                          hasUpvoted
                                            ? "inline-flex shrink-0 self-start items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-violet-800 opacity-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
                                            : "inline-flex shrink-0 self-start items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold tabular-nums text-zinc-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98] disabled:pointer-events-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-violet-500 dark:hover:bg-violet-950/40"
                                        }
                                      >
                                        <ThumbsUp
                                          className="size-3.5 shrink-0"
                                          strokeWidth={2}
                                          aria-hidden
                                        />
                                        {r.upvotes}
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {decision.context ? (
              <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Context
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {decision.context}
                </p>
              </div>
            ) : null}

            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Submitted
              </span>{" "}
              {formatSubmittedAt(decision.createdAt)}
            </p>
          </article>
        )}
      </div>
    </div>
  );
}
