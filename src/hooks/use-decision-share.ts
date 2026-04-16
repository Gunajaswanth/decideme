"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function decisionDetailUrl(id: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/decision/${encodeURIComponent(id)}`;
}

function isAbortError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true;
  return Boolean(
    err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name: string }).name === "AbortError",
  );
}

export function useDecisionShare() {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const showShareFeedback = useCallback((message: string) => {
    setShareFeedback(message);
    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = setTimeout(() => {
      setShareFeedback(null);
      shareTimeoutRef.current = null;
    }, 2500);
  }, []);

  const shareDecision = useCallback(
    async (id: string, question: string) => {
      if (typeof window === "undefined") return;
      const url = decisionDetailUrl(id);
      if (!url) return;

      if (typeof navigator !== "undefined" && "share" in navigator && navigator.share) {
        try {
          await navigator.share({
            title: "DecideMe",
            text: question,
            url,
          });
          showShareFeedback("Shared");
          return;
        } catch (err: unknown) {
          if (isAbortError(err)) return;
        }
      }

      try {
        await navigator.clipboard.writeText(url);
        showShareFeedback("Link copied");
      } catch {
        showShareFeedback("Could not copy link");
      }
    },
    [showShareFeedback],
  );

  return { shareFeedback, shareDecision };
}
