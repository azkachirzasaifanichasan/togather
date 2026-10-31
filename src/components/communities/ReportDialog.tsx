"use client";

import { useEffect, useRef, useState } from "react";

export type ReportTarget = {
  type: "POST" | "COMMENT";
  id: string;
};

export type ReportReasonValue =
  | "MINOR"
  | "BULLYING"
  | "SUICIDE_SELF_HARM"
  | "VIOLENCE"
  | "RESTRICTED_ITEMS"
  | "ADULT_CONTENT"
  | "SCAM"
  | "INTELLECTUAL_PROPERTY"
  | "NOT_INTERESTED";

const REASONS: { value: ReportReasonValue; label: string }[] = [
  { value: "MINOR", label: "Problem involving someone under 18" },
  { value: "BULLYING", label: "Bullying, harassment or abuse" },
  { value: "SUICIDE_SELF_HARM", label: "Suicide or self-harm" },
  { value: "VIOLENCE", label: "Violent, hateful or disturbing content" },
  { value: "RESTRICTED_ITEMS", label: "Selling or promoting restricted items" },
  { value: "ADULT_CONTENT", label: "Adult content" },
  { value: "SCAM", label: "Scam, fraud or false information" },
  { value: "INTELLECTUAL_PROPERTY", label: "Intellectual property" },
  { value: "NOT_INTERESTED", label: "I don't want to see this" },
];

/**
 * The report sheet for a post or comment.
 *
 * Picking a reason files the report immediately; the success screen is the
 * confirmation step. Closing the sheet is the only exit, so a failed request
 * can be retried without losing the target.
 */
export function ReportDialog({
  target,
  onClose,
  onSubmitted,
}: {
  target: ReportTarget | null;
  onClose: () => void;
  onSubmitted?: (target: ReportTarget, reason: ReportReasonValue) => void;
}) {
  if (!target) return null;

  // Keying by target resets the sheet's local state when the viewer switches
  // from a post to a comment without reopening the dialog.
  return (
    <ReportSheet
      key={`${target.type}:${target.id}`}
      target={target}
      onClose={onClose}
      onSubmitted={onSubmitted}
    />
  );
}

function ReportSheet({
  target,
  onClose,
  onSubmitted,
}: {
  target: ReportTarget;
  onClose: () => void;
  onSubmitted?: (target: ReportTarget, reason: ReportReasonValue) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [pendingReason, setPendingReason] = useState<ReportReasonValue | null>(
    null
  );
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const reasonWord = target.type === "POST" ? "post" : "comment";

  const submit = async (reason: ReportReasonValue) => {
    if (pendingReason) return;

    setPendingReason(reason);
    setStatus("idle");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: target.type,
          targetId: target.id,
          reason,
        }),
      });

      if (!response.ok) throw new Error("Report failed");

      setStatus("done");
      onSubmitted?.(target, reason);
    } catch {
      setStatus("error");
    } finally {
      setPendingReason(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative border-b border-gray-100 px-5 py-4">
          <h2
            id="report-dialog-title"
            className="text-center text-base font-bold text-gray-900"
          >
            Report
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {status === "done" ? (
          <div className="px-6 py-10 text-center" role="status">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-gray-900">
              Report submitted
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Thanks for letting us know. We&apos;ll review this {reasonWord}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-[#7960D7] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6950c7]"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto px-5 pb-4 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Why are you reporting this {reasonWord}?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              If someone is in immediate danger, get help before reporting to
              Togather. Don&apos;t wait.
            </p>

            <div className="mt-2">
              {REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => submit(reason.value)}
                  disabled={pendingReason !== null}
                  className="flex w-full items-center justify-between gap-4 border-b border-gray-100 py-3 text-left text-sm font-medium text-gray-900 transition-colors last:border-b-0 hover:text-[#7960D7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{reason.label}</span>
                  {pendingReason === reason.value ? (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-[#7960D7]"
                    />
                  ) : (
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {status === "error" && (
              <p className="mt-3 text-xs font-medium text-red-600" role="alert">
                Couldn&apos;t submit the report. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
