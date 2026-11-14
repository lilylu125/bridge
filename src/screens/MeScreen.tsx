import { useState } from "react";
import { Shield, SlidersHorizontal, Database, Trash2 } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";
import { useStudentData } from "../context/StudentDataContext";
import { SpeakButton } from "../components/SpeakButton";

export function MeScreen() {
  const { settings, resetSettings } = useAccessibility();
  const { data, deleteEverything } = useStudentData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const adaptations = [
    {
      title: "6-minute chunks",
      reason: "Your recall drops after minute 6.",
    },
    {
      title: "Study nudge after Tuesday lab",
      reason: "You picked this time.",
    },
    {
      title: settings.readAloudEnabled ? "Read aloud on" : "Read aloud off",
      reason: settings.readAloudEnabled
        ? "You turned it on."
        : "Available anytime in Aa.",
    },
    {
      title: "Weekly fresh restart",
      reason:
        "Every week clears old misses for a clean start, and raises your personal bar after a strong week.",
    },
    {
      title: "Practice pacing",
      reason:
        "Questions get harder after 2 right in a row and easier after a miss.",
    },
  ];

  const savedAnswerCount =
    Object.keys(data.practiceResponses).length +
    Object.keys(data.co2CheckStatus).length +
    Object.keys(data.wordProblemWork).length;
  const savedAskCount = data.askHistory.length;

  const handleConfirmDelete = () => {
    deleteEverything();
    resetSettings();
    setConfirmingDelete(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">
          Your data and settings
        </h1>
        <p className="text-sm text-[var(--bridge-text-secondary)] mt-0.5">
          Everything here belongs to you.
        </p>
      </div>

      {/* Top Teal Privacy Card */}
      <section className="rounded-2xl bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] p-5 sm:p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm sm:text-base font-medium leading-relaxed">
            Only you can see this. Instructors see class-wide patterns only (10+ students).
          </p>
        </div>
      </section>

      {/* How Bridge adapts to you */}
      <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="w-4 h-4 text-[var(--bridge-teal)]"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold font-heading">
              How Bridge adapts to you
            </h2>
          </div>
          <SpeakButton
            text={adaptations.map((a) => `${a.title}: ${a.reason}`).join(" ")}
            sourceId="me-adaptations"
            label="Read how Bridge adapts aloud"
          />
        </div>

        <ul className="divide-y divide-[var(--bridge-border)]">
          {adaptations.map((item) => (
            <li key={item.title} className="py-3 first:pt-1 last:pb-1">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-sm text-[var(--bridge-text-secondary)] mt-0.5">
                {item.reason}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* What we store / never store */}
      <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database
              className="w-4 h-4 text-[var(--bridge-teal)]"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold font-heading">
              What we store
            </h2>
          </div>
          <SpeakButton
            text="What we store: this week's answers, Sure and Not sure taps, settings, Ask questions. What we never store: diagnoses, disabilities, or guesses about you."
            sourceId="me-storage"
            label="Read data policy aloud"
          />
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">What we store:</span> this week&apos;s answers, Sure/Not sure taps, settings, Ask questions.
          </p>
          <p className="text-[var(--bridge-text-secondary)]">
            <span className="font-semibold text-[var(--bridge-text)]">
              What we never store:
            </span>{" "}
            diagnoses, disabilities, or guesses about you.
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--bridge-border)] text-xs text-[var(--bridge-text-secondary)] tabular-nums">
          Currently stored on this device: {savedAnswerCount} practice responses ·{" "}
          {savedAskCount} Ask questions
        </div>
      </section>

      {/* Delete everything */}
      <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-3">
        {data.hasDeletedData && (
          <div
            role="status"
            className="rounded-xl bg-[var(--bridge-teal-soft)] border border-[var(--bridge-teal)] text-[var(--bridge-teal)] p-3.5 text-sm font-medium"
          >
            Your stored answers, Sure/Not sure taps, Ask questions, and custom settings have been deleted.
          </div>
        )}

        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-[var(--bridge-danger)] bg-[var(--bridge-danger-soft)] text-[var(--bridge-danger)] text-sm font-semibold hover:opacity-90 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Delete everything</span>
          </button>
        ) : (
          <div className="rounded-xl border border-[var(--bridge-danger)] bg-[var(--bridge-danger-soft)] p-4 space-y-3">
            <p className="text-sm font-medium text-[var(--bridge-text)]">
              Delete all stored answers, Sure/Not sure taps, Ask questions, and accessibility settings on this device?
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[44px] px-4 rounded-xl bg-[#B42318] text-white text-sm font-semibold cursor-pointer"
              >
                Yes, delete everything
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="min-h-[44px] px-4 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-[var(--bridge-text)] text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
