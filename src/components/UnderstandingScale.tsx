import { UnderstandingLevel } from "../types";
import { SpeakButton } from "./SpeakButton";

export const UNDERSTANDING_STEPS: {
  level: UnderstandingLevel;
  shortLabel: string;
  description: string;
}[] = [
  {
    level: 1,
    shortLabel: "Just starting",
    description: "Seeing these terms for the first time",
  },
  {
    level: 2,
    shortLabel: "Getting familiar",
    description: "Recognize the ideas, still checking steps",
  },
  {
    level: 3,
    shortLabel: "Building steady",
    description: "Can follow examples with a few hints",
  },
  {
    level: 4,
    shortLabel: "Solid grasp",
    description: "Can work through problems on your own",
  },
  {
    level: 5,
    shortLabel: "Ready to explain",
    description: "Clear enough to walk someone else through",
  },
];

interface UnderstandingScaleProps {
  value: UnderstandingLevel;
  onChange?: (level: UnderstandingLevel) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  sourceId?: string;
}

export function UnderstandingScale({
  value,
  onChange,
  title = "Level of understanding",
  subtitle,
  compact = false,
  sourceId = "understanding-scale",
}: UnderstandingScaleProps) {
  const activeStep =
    UNDERSTANDING_STEPS.find((s) => s.level === value) ??
    UNDERSTANDING_STEPS[2];

  if (compact) {
    return (
      <div className="space-y-1.5" aria-label={`Understanding level ${value} of 5: ${activeStep.shortLabel}`}>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-[var(--bridge-text-secondary)]">
            Understanding
          </span>
          <span className="font-semibold text-[var(--bridge-teal)] tabular-nums">
            {value}/5 · {activeStep.shortLabel}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {UNDERSTANDING_STEPS.map((step) => {
            const filled = step.level <= value;
            return (
              <div
                key={step.level}
                className={`h-2 rounded-full ${
                  filled
                    ? "bg-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-border)]"
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold font-heading">{title}</h2>
          <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
            {subtitle ??
              `Currently at ${value} of 5 — ${activeStep.shortLabel}: ${activeStep.description}`}
          </p>
        </div>
        <SpeakButton
          text={`${title}. Level ${value} of 5: ${activeStep.shortLabel}. ${activeStep.description}.`}
          sourceId={sourceId}
          label="Read understanding level aloud"
        />
      </div>

      {/* Visual stepped scale (1 to 5) */}
      <div
        role={onChange ? "radiogroup" : "group"}
        aria-label={title}
        className="grid grid-cols-5 gap-2"
      >
        {UNDERSTANDING_STEPS.map((step) => {
          const isFilled = step.level <= value;
          const isSelected = step.level === value;
          const isLow = value <= 2 && step.level <= value;

          const barBg = isFilled
            ? isLow
              ? "bg-[var(--bridge-amber)]"
              : "bg-[var(--bridge-teal-solid)]"
            : "bg-[var(--bridge-surface-subtle)]";

          if (!onChange) {
            return (
              <div
                key={step.level}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <div
                  className={`w-full h-3 rounded-lg border ${
                    isFilled
                      ? isLow
                        ? "border-[var(--bridge-amber)]"
                        : "border-[var(--bridge-teal)]"
                      : "border-[var(--bridge-border)]"
                  } ${barBg}`}
                />
                <span
                  className={`text-xs tabular-nums ${
                    isSelected
                      ? "font-bold text-[var(--bridge-text)]"
                      : "text-[var(--bridge-text-secondary)]"
                  }`}
                >
                  {step.level}
                </span>
              </div>
            );
          }

          return (
            <button
              key={step.level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Level ${step.level}: ${step.shortLabel}`}
              onClick={() => onChange(step.level)}
              className={`min-h-[56px] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-colors cursor-pointer ${
                isSelected
                  ? "border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] font-semibold"
                  : isFilled
                    ? "border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text)] hover:border-[var(--bridge-teal)]"
                    : "border-[var(--bridge-border)] bg-[var(--bridge-card)] text-[var(--bridge-text-secondary)] hover:border-[var(--bridge-teal)]"
              }`}
            >
              <span className="text-sm font-bold font-heading tabular-nums">
                {step.level}
              </span>
              <span className="text-[11px] leading-tight line-clamp-2">
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explicit current status strip (never color alone) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-[var(--bridge-text-secondary)]">
          1 · Just starting
        </span>
        <span className="font-semibold text-[var(--bridge-teal)] tabular-nums">
          Level {value}/5 · {activeStep.shortLabel}
        </span>
        <span className="text-[var(--bridge-text-secondary)]">
          5 · Ready to explain
        </span>
      </div>
    </div>
  );
}
