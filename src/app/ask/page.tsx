"use client";

import { FormEvent, useMemo, useState } from "react";

import { useDecisions } from "@/context/decisions-context";
import { BRAND_TAGLINE, BTN_DISABLED, BTN_PRIMARY } from "@/lib/product-ui";

const CATEGORIES = [
  "Career",
  "Money",
  "Tech",
  "Education",
  "Lifestyle",
] as const;

type Touched = {
  question: boolean;
  option1: boolean;
  option2: boolean;
};

const initialTouched: Touched = {
  question: false,
  option1: false,
  option2: false,
};

export default function AskPage() {
  const { addSubmittedDecision } = useDecisions();
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [category, setCategory] = useState<string>("");
  const [context, setContext] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [touched, setTouched] = useState<Touched>(initialTouched);
  const [submitted, setSubmitted] = useState(false);

  const qOk = question.trim().length > 0;
  const o1Ok = option1.trim().length > 0;
  const o2Ok = option2.trim().length > 0;

  const errors = useMemo(
    () => ({
      question: touched.question && !qOk ? "Add a question so voters know what they're deciding." : null,
      option1: touched.option1 && !o1Ok ? "Option 1 is required." : null,
      option2: touched.option2 && !o2Ok ? "Option 2 is required." : null,
    }),
    [touched, qOk, o1Ok, o2Ok],
  );

  const canSubmit = qOk && o1Ok && o2Ok;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const options = [option1, option2, option3, option4]
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    addSubmittedDecision({
      question: question.trim(),
      options,
      category: category.trim(),
      context: context.trim(),
      anonymous,
    });
    setSubmitted(true);
  }

  function resetForm() {
    setQuestion("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setCategory("");
    setContext("");
    setAnonymous(true);
    setTouched(initialTouched);
    setSubmitted(false);
  }

  const fieldClass =
    "w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500 dark:focus:bg-zinc-900 dark:focus:ring-violet-400/25";

  const labelClass = "text-sm font-semibold text-zinc-800 dark:text-zinc-100";
  const helperClass = "mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400";
  const errorClass = "mt-1.5 text-xs font-medium text-red-600 dark:text-red-400";

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-[400px]">
        <header className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            DecideMe
          </p>
          <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {BRAND_TAGLINE}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ask
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Frame the tradeoff and choices—it saves to Explore on this device so you
            can vote, share, and iterate.
          </p>
        </header>

        {submitted ? (
          <div
            className="rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:border-emerald-900/50 dark:bg-zinc-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
            role="status"
            aria-live="polite"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Saved to Explore
            </h2>
            <p className="mt-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
              Open Explore to preview, vote, and share when you&apos;re ready—everything
              stays in this browser.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className={`${BTN_PRIMARY} mt-6`}
            >
              New decision
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
            noValidate
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="ask-question" className={labelClass}>
                  Question <span className="text-red-500">*</span>
                </label>
                <p className={helperClass}>
                  One sentence works best. Be specific so votes stay meaningful.
                </p>
                <textarea
                  id="ask-question"
                  name="question"
                  required
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, question: true }))}
                  className={`${fieldClass} mt-2 resize-y min-h-[5.5rem]`}
                  placeholder="e.g. Should I take the offer or wait for a counter?"
                  aria-invalid={!!errors.question}
                  aria-describedby={
                    errors.question ? "err-question hint-question" : "hint-question"
                  }
                />
                <span id="hint-question" className="sr-only">
                  Required. Summarize what you are deciding.
                </span>
                {errors.question ? (
                  <p id="err-question" className={errorClass} role="alert">
                    {errors.question}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="ask-option1" className={labelClass}>
                  Option 1 <span className="text-red-500">*</span>
                </label>
                <p className={helperClass}>The first choice voters will see.</p>
                <input
                  id="ask-option1"
                  name="option1"
                  type="text"
                  required
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, option1: true }))}
                  className={`${fieldClass} mt-2`}
                  placeholder="Short label"
                  autoComplete="off"
                  aria-invalid={!!errors.option1}
                  aria-describedby={errors.option1 ? "err-o1" : undefined}
                />
                {errors.option1 ? (
                  <p id="err-o1" className={errorClass} role="alert">
                    {errors.option1}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="ask-option2" className={labelClass}>
                  Option 2 <span className="text-red-500">*</span>
                </label>
                <p className={helperClass}>The alternative to compare against.</p>
                <input
                  id="ask-option2"
                  name="option2"
                  type="text"
                  required
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, option2: true }))}
                  className={`${fieldClass} mt-2`}
                  placeholder="Short label"
                  autoComplete="off"
                  aria-invalid={!!errors.option2}
                  aria-describedby={errors.option2 ? "err-o2" : undefined}
                />
                {errors.option2 ? (
                  <p id="err-o2" className={errorClass} role="alert">
                    {errors.option2}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="ask-option3" className={labelClass}>
                  Option 3 <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <p className={helperClass}>
                  Add another path if your decision isn&apos;t strictly binary.
                </p>
                <input
                  id="ask-option3"
                  name="option3"
                  type="text"
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                  className={`${fieldClass} mt-2`}
                  placeholder="Optional"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="ask-option4" className={labelClass}>
                  Option 4 <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <p className={helperClass}>Rarely needed — only if it clarifies the tradeoff.</p>
                <input
                  id="ask-option4"
                  name="option4"
                  type="text"
                  value={option4}
                  onChange={(e) => setOption4(e.target.value)}
                  className={`${fieldClass} mt-2`}
                  placeholder="Optional"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="ask-category" className={labelClass}>
                  Category
                </label>
                <p className={helperClass}>
                  Keeps your Explore list tidy when you filter by topic.
                </p>
                <select
                  id="ask-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${fieldClass} mt-2 cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 dark:bg-zinc-800/60`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ask-context" className={labelClass}>
                  Context{" "}
                  <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <p className={helperClass}>
                  Constraints, deadlines, or stakes — keep it short; voters skim fast.
                </p>
                <textarea
                  id="ask-context"
                  name="context"
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className={`${fieldClass} mt-2 resize-y min-h-[5rem]`}
                  placeholder="e.g. Offer expires Friday; I value flexibility over max salary."
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-800/50">
                <div className="min-w-0">
                  <p className={`${labelClass} text-sm`}>Post anonymously</p>
                  <p className={`${helperClass} mt-0.5`}>
                    Labels the post Anonymous everywhere others see it.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={anonymous}
                  onClick={() => setAnonymous((a) => !a)}
                  className={`relative inline-flex h-8 w-[3.25rem] shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                    anonymous
                      ? "bg-violet-600 dark:bg-violet-500"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute top-1/2 size-7 -translate-y-1/2 rounded-full bg-white shadow-md transition-[left] duration-200 ease-out ${
                      anonymous ? "left-[calc(100%-1.75rem-0.125rem)]" : "left-0.5"
                    }`}
                  />
                  <span className="sr-only">
                    {anonymous ? "Anonymous posting on" : "Anonymous posting off"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`${BTN_PRIMARY} mt-8 ${BTN_DISABLED}`}
            >
              Post to Explore
            </button>
            <p className="mt-3 text-center text-xs leading-snug text-zinc-500 dark:text-zinc-400">
              No account needed — your submissions are saved on this device.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
