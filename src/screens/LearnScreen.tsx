import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BookOpenCheck,
  GitBranch,
  ArrowRight,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { getCourseById } from "../data/chemistryData";
import { SpeakButton } from "../components/SpeakButton";
import { SpeechInputButton } from "../components/SpeechInputButton";
import { TimestampChip } from "../components/TimestampChip";
import { useAccessibility } from "../context/AccessibilityContext";
import { useStudentData } from "../context/StudentDataContext";

interface LostThreadResult {
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    feedback: string;
    timestamp: string;
  };
  recap: {
    bullet: string;
    timestamp: string;
  }[];
}

interface SimplerResult {
  explanation: string;
  timestamps: string[];
}

interface VisualizeResult {
  title: string;
  nodes: string[];
  caption: string;
  timestamps: string[];
}

interface AskResult {
  covered: boolean;
  answer: string;
  timestamps: string[];
}

interface LearnScreenProps {
  highlightedTimestamp: string | null;
  onClearHighlight: () => void;
}

export function LearnScreen({
  highlightedTimestamp,
  onClearHighlight,
}: LearnScreenProps) {
  const { settings } = useAccessibility();
  const { data, addAskRecord } = useStudentData();

  const course = getCourseById(data.activeCourseId);
  const [chunkIdx, setChunkIdx] = useState(course.defaultChunkIndex);

  useEffect(() => {
    setChunkIdx(course.defaultChunkIndex);
    setActiveHelper(null);
    setLostData(null);
    setLostSelectedOption(null);
    setSimplerData(null);
    setVisualizeData(null);
    setAskResult(null);
  }, [course.id, course.defaultChunkIndex]);

  const currentChunk = course.chunks[chunkIdx] ?? course.chunks[0];

  const [activeHelper, setActiveHelper] = useState<
    "lost" | "simpler" | "visualize" | null
  >(null);
  const [loadingHelper, setLoadingHelper] = useState<
    "lost" | "simpler" | "visualize" | null
  >(null);

  const [lostData, setLostData] = useState<LostThreadResult | null>(null);
  const [lostSelectedOption, setLostSelectedOption] = useState<number | null>(
    null
  );
  const [simplerData, setSimplerData] = useState<SimplerResult | null>(null);
  const [visualizeData, setVisualizeData] = useState<VisualizeResult | null>(
    null
  );

  const [askInput, setAskInput] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [voiceFallbackMsg, setVoiceFallbackMsg] = useState<string | null>(null);

  const chunkFullText = currentChunk.lines
    .map((line) => `[${line.timestamp}] ${line.text}`)
    .join("\n");

  const chunkReadAloudText = currentChunk.lines
    .map((line) => line.text)
    .join(" ");

  const handleChunkChange = (nextIdx: number) => {
    setChunkIdx(nextIdx);
    onClearHighlight();
    setActiveHelper(null);
    setLostData(null);
    setLostSelectedOption(null);
    setSimplerData(null);
    setVisualizeData(null);
  };

  const handleLostThread = async () => {
    setActiveHelper("lost");
    setLoadingHelper("lost");
    setLostSelectedOption(null);
    try {
      const res = await fetch("/api/lecture/lost-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunkTitle: currentChunk.title,
          chunkText: chunkFullText,
          lectureText: course.sampleLectureText,
          lecturePrefix: course.lecturePrefix,
        }),
      });
      const json = await res.json();
      setLostData(json);
    } catch {
      setLostData(null);
    } finally {
      setLoadingHelper(null);
    }
  };

  const handleExplainSimpler = async () => {
    setActiveHelper("simpler");
    setLoadingHelper("simpler");
    try {
      const res = await fetch("/api/lecture/explain-simpler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunkTitle: currentChunk.title,
          chunkText: chunkFullText,
          lectureText: course.sampleLectureText,
          lecturePrefix: course.lecturePrefix,
        }),
      });
      const json = await res.json();
      setSimplerData(json);
    } catch {
      setSimplerData(null);
    } finally {
      setLoadingHelper(null);
    }
  };

  const handleVisualize = async () => {
    setActiveHelper("visualize");
    setLoadingHelper("visualize");
    try {
      const res = await fetch("/api/lecture/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunkTitle: currentChunk.title,
          chunkText: chunkFullText,
          lectureText: course.sampleLectureText,
          lecturePrefix: course.lecturePrefix,
        }),
      });
      const json = await res.json();
      setVisualizeData(json);
    } catch {
      setVisualizeData(null);
    } finally {
      setLoadingHelper(null);
    }
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = askInput.trim();
    if (!trimmed || askLoading) return;

    setAskLoading(true);
    setVoiceFallbackMsg(null);
    try {
      const res = await fetch("/api/lecture/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          lectureText: course.sampleLectureText,
          lecturePrefix: course.lecturePrefix,
        }),
      });
      const json: AskResult = await res.json();
      setAskResult(json);
      addAskRecord({
        id: `${Date.now()}`,
        courseId: course.id,
        question: trimmed,
        answer: json.answer,
        timestamps: json.timestamps ?? [],
        covered: json.covered,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setAskResult({
        covered: false,
        answer: "That isn't covered in this lecture. Try asking your TA.",
        timestamps: [],
      });
    } finally {
      setAskLoading(false);
    }
  };

  const focusTimestampLine = (timestamp: string) => {
    if (
      course.id === "chem101" &&
      ["11:52", "13:30", "14:20", "22:10"].includes(timestamp)
    ) {
      setChunkIdx(2);
    }
    const el = document.getElementById(`lecture-line-${timestamp}`);
    el?.scrollIntoView({
      behavior: settings.reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <div className="space-y-5">
      {/* Chunk Header & Previous/Next */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
            {course.lecturePrefix} · Chunk {currentChunk.index} of{" "}
            {currentChunk.total} ({currentChunk.timeRange})
          </h1>
          <p className="text-sm text-[var(--bridge-text-secondary)] mt-0.5">
            {course.code} · {currentChunk.title}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={chunkIdx === 0}
            onClick={() => handleChunkChange(chunkIdx - 1)}
            aria-label="Previous chunk"
            className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--bridge-teal)] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            disabled={chunkIdx === course.chunks.length - 1}
            onClick={() => handleChunkChange(chunkIdx + 1)}
            aria-label="Next chunk"
            className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--bridge-teal)] cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Readable Lecture Text Card */}
      <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-semibold text-[var(--bridge-teal)]">
            Lecture transcript
          </span>
          <SpeakButton
            text={chunkReadAloudText}
            sourceId={`learn-chunk-${course.id}-${currentChunk.index}`}
            label="Read lecture chunk aloud"
          />
        </div>

        <div className="space-y-4">
          {currentChunk.lines.map((line) => {
            const isHighlighted = highlightedTimestamp === line.timestamp;
            return (
              <div
                key={line.timestamp}
                id={`lecture-line-${line.timestamp}`}
                className={`rounded-xl p-3.5 transition-colors ${
                  isHighlighted
                    ? "bg-[var(--bridge-teal-soft)] border border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-surface-subtle)] border border-transparent"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
                  <span className="text-xs font-semibold text-[var(--bridge-teal)] tabular-nums shrink-0">
                    [{line.timestamp}]
                  </span>
                  <p className="text-[var(--bridge-text)] leading-relaxed">
                    {line.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {highlightedTimestamp && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onClearHighlight}
              className="text-xs font-medium text-[var(--bridge-teal)] underline cursor-pointer min-h-[36px] px-2"
            >
              Clear highlight
            </button>
          </div>
        )}
      </section>

      {/* Three Action Buttons */}
      <section
        aria-label="Study helpers for this chunk"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        <button
          type="button"
          onClick={handleLostThread}
          aria-pressed={activeHelper === "lost"}
          className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
            activeHelper === "lost"
              ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
              : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>I lost the thread</span>
        </button>

        <button
          type="button"
          onClick={handleExplainSimpler}
          aria-pressed={activeHelper === "simpler"}
          className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
            activeHelper === "simpler"
              ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
              : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
          }`}
        >
          <BookOpenCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Explain simpler</span>
        </button>

        <button
          type="button"
          onClick={handleVisualize}
          aria-pressed={activeHelper === "visualize"}
          className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
            activeHelper === "visualize"
              ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
              : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
          }`}
        >
          <GitBranch className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Visualize</span>
        </button>
      </section>

      {/* Active Helper Output */}
      {loadingHelper && (
        <div
          role="status"
          className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 flex items-center gap-3 text-sm text-[var(--bridge-text-secondary)]"
        >
          <Loader2
            className="w-4 h-4 animate-spin text-[var(--bridge-teal)]"
            aria-hidden="true"
          />
          <span>Reading {course.lecturePrefix} transcript…</span>
        </div>
      )}

      {!loadingHelper && activeHelper === "lost" && lostData && (
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold font-heading">
                Quick check-in first
              </h2>
              <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
                Answer this one question to unlock the 3-bullet recap.
              </p>
            </div>
            <SpeakButton
              text={lostData.question.prompt}
              sourceId="lost-question"
              label="Read check-in question aloud"
            />
          </div>

          <p className="font-medium">{lostData.question.prompt}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lostData.question.options.map((opt, idx) => {
              const selected = lostSelectedOption === idx;
              const isCorrect = idx === lostData.question.correctIndex;
              const answered = lostSelectedOption !== null;

              let btnStyle =
                "border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] hover:border-[var(--bridge-teal)]";
              if (answered && isCorrect) {
                btnStyle =
                  "border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] font-semibold";
              } else if (answered && selected && !isCorrect) {
                btnStyle =
                  "border-[var(--bridge-amber)] bg-[var(--bridge-amber-soft)] text-[var(--bridge-amber)]";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLostSelectedOption(idx)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {answered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  {answered && selected && !isCorrect && (
                    <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {lostSelectedOption !== null && (
            <div className="pt-3 border-t border-[var(--bridge-border)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-[var(--bridge-text)]">
                  {lostData.question.feedback}
                </p>
                <TimestampChip
                  label={lostData.question.timestamp}
                  onSelect={focusTimestampLine}
                />
              </div>

              <div className="rounded-xl bg-[var(--bridge-surface-subtle)] p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold font-heading">
                    3-bullet recap
                  </h3>
                  <SpeakButton
                    text={lostData.recap.map((r) => r.bullet).join(" ")}
                    sourceId="lost-recap"
                    label="Read 3-bullet recap aloud"
                  />
                </div>
                <ul className="space-y-3">
                  {lostData.recap.map((item, i) => (
                    <li
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                    >
                      <span>• {item.bullet}</span>
                      <div className="shrink-0">
                        <TimestampChip
                          label={item.timestamp}
                          onSelect={focusTimestampLine}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}

      {!loadingHelper && activeHelper === "simpler" && simplerData && (
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold font-heading">
                Plain-language summary
              </h2>
              <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
                Rewritten from {course.lecturePrefix} at an everyday reading level
              </p>
            </div>
            <SpeakButton
              text={simplerData.explanation}
              sourceId="simpler-card"
              label="Read plain-language summary aloud"
            />
          </div>
          <p className="text-[var(--bridge-text)] leading-relaxed">
            {simplerData.explanation}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {simplerData.timestamps.map((ts) => (
              <TimestampChip
                key={ts}
                label={ts}
                onSelect={focusTimestampLine}
              />
            ))}
          </div>
        </section>
      )}

      {!loadingHelper && activeHelper === "visualize" && visualizeData && (
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold font-heading">
                {visualizeData.title}
              </h2>
              <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
                Step-by-step concept flow
              </p>
            </div>
            <SpeakButton
              text={`${visualizeData.title}. ${visualizeData.nodes.join(", then ")}. ${visualizeData.caption}`}
              sourceId="visualize-card"
              label="Read flow diagram aloud"
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-2 py-2"
            role="list"
            aria-label="Concept flow diagram"
          >
            {visualizeData.nodes.map((node, i) => {
              const isOperation =
                node.startsWith("÷") ||
                node.startsWith("×") ||
                node.startsWith("+") ||
                node.startsWith("-");
              return (
                <div
                  key={`${node}-${i}`}
                  role="listitem"
                  className="flex items-center gap-2"
                >
                  <div
                    className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium ${
                      isOperation
                        ? "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)]"
                        : "bg-[var(--bridge-surface-subtle)] border-[var(--bridge-border)] text-[var(--bridge-text)] font-semibold"
                    }`}
                  >
                    {node}
                  </div>
                  {i < visualizeData.nodes.length - 1 && (
                    <ArrowRight
                      className="w-4 h-4 text-[var(--bridge-text-secondary)] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-sm text-[var(--bridge-text-secondary)]">
            {visualizeData.caption}
          </p>

          <div className="flex flex-wrap gap-2">
            {visualizeData.timestamps.map((ts) => (
              <TimestampChip
                key={ts}
                label={ts}
                onSelect={focusTimestampLine}
              />
            ))}
          </div>
        </section>
      )}

      {/* Ask about this lecture */}
      {!settings.focusMode && (
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold font-heading">
              Ask about this lecture
            </h2>
            <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
              Answers come only from {course.lecturePrefix} and cite timestamps.
            </p>
          </div>

          <form onSubmit={handleAskSubmit} className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="ask-lecture-input" className="sr-only">
                Ask a question about {course.lecturePrefix}
              </label>
              <input
                id="ask-lecture-input"
                type="text"
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                placeholder={`Ask a question about ${course.shortTitle.toLowerCase()}…`}
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-bg)] text-[var(--bridge-text)] text-sm placeholder:text-[var(--bridge-text-secondary)]"
              />
              <SpeechInputButton
                ariaLabel="Speak your question about this lecture"
                onTranscript={(text) => {
                  setAskInput(text);
                  setVoiceFallbackMsg(null);
                }}
                onUnsupported={(msg) => setVoiceFallbackMsg(msg)}
              />
              <button
                type="submit"
                disabled={!askInput.trim() || askLoading}
                aria-label="Send question"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-sm font-semibold disabled:opacity-50 cursor-pointer shrink-0"
              >
                {askLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
                <span>Ask</span>
              </button>
            </div>
            {voiceFallbackMsg && (
              <p className="text-xs text-[var(--bridge-text-secondary)]">
                {voiceFallbackMsg}
              </p>
            )}
          </form>

          {askResult && (
            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed text-[var(--bridge-text)]">
                  {askResult.answer}
                </p>
                <SpeakButton
                  text={askResult.answer}
                  sourceId="ask-answer-card"
                  label="Read answer aloud"
                />
              </div>
              {askResult.timestamps && askResult.timestamps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {askResult.timestamps.map((ts) => (
                    <TimestampChip
                      key={ts}
                      label={ts}
                      onSelect={focusTimestampLine}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
