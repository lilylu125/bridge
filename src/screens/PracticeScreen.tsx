import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Lock,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Loader2,
  HeartHandshake,
  BookOpen,
} from "lucide-react";
import { getCourseById } from "../data/chemistryData";
import { ConfidenceLevel, WorkMode } from "../types";
import { SpeakButton } from "../components/SpeakButton";
import { SpeechInputButton } from "../components/SpeechInputButton";
import { TimestampChip } from "../components/TimestampChip";
import { ShowWorkPad } from "../components/ShowWorkPad";
import { UnderstandingScale } from "../components/UnderstandingScale";
import { useStudentData } from "../context/StudentDataContext";
import { useAccessibility } from "../context/AccessibilityContext";

interface PracticeScreenProps {
  onJumpToLecture: (timestamp: string) => void;
  onReturnHome: () => void;
}

function parseSpokenNumber(transcript: string): string {
  const numericMatch = transcript.match(/\d+(\.\d+)?/);
  if (numericMatch) return numericMatch[0];
  return transcript.trim();
}

const SESSION_MC_SLOTS = 3;

export function PracticeScreen({
  onJumpToLecture,
  onReturnHome,
}: PracticeScreenProps) {
  const { settings } = useAccessibility();
  const {
    data,
    setUnderstandingLevel,
    answerAdaptiveQuestion,
    switchToGentleWarmup,
    exitWelcomeBackSession,
    recordCo2Attempt,
    saveWordProblemWork,
    resetPracticeSession,
  } = useStudentData();

  const course = getCourseById(data.activeCourseId);
  const adaptiveState = data.adaptiveByCourse[course.id];
  const sessionQuestions = adaptiveState.selectedQuestionIds
    .map((id) => course.practiceQuestions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  const calcProblem = course.calculationProblem;
  const wordProblem = course.wordProblem;

  const mcCount = data.welcomeBackMode ? 1 : SESSION_MC_SLOTS;
  const calcStepIndex = mcCount;
  const wordStepIndex = mcCount + 1;
  const totalSteps = data.welcomeBackMode ? 1 : mcCount + 2;

  const [stepIndex, setStepIndex] = useState(0);
  const [pendingConfidence, setPendingConfidence] =
    useState<ConfidenceLevel | null>(null);
  const [encouragementDismissed, setEncouragementDismissed] = useState(false);

  // Calculation state
  const savedCalc = data.co2CheckStatus[calcProblem.id];
  const [calcInput, setCalcInput] = useState(savedCalc?.submittedValue ?? "");
  const [calcRevealedHints, setCalcRevealedHints] = useState<number>(0);
  const [calcFeedback, setCalcFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  // Word problem state
  const savedWordWork = data.wordProblemWork[wordProblem.id];
  const [workMode, setWorkMode] = useState<WorkMode>(
    savedWordWork?.workMode ?? "write"
  );
  const [explanationText, setExplanationText] = useState(
    savedWordWork?.explanationText ?? ""
  );
  const [sketchDataUrl, setSketchDataUrl] = useState<string | null>(
    savedWordWork?.sketchDataUrl ?? null
  );
  const [wordAnswerInput, setWordAnswerInput] = useState(
    savedWordWork?.submittedAnswer ?? ""
  );
  const [wordFeedback, setWordFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [wordRevealedHints, setWordRevealedHints] = useState<number>(0);
  const [workHintLoading, setWorkHintLoading] = useState(false);
  const [workAiHint, setWorkAiHint] = useState<{
    hint: string;
    timestamp: string;
  } | null>(null);
  const [wordVoiceNote, setWordVoiceNote] = useState<string | null>(null);

  useEffect(() => {
    setStepIndex(0);
    setPendingConfidence(null);
    setEncouragementDismissed(false);
    const nextCalc = data.co2CheckStatus[calcProblem.id];
    setCalcInput(nextCalc?.submittedValue ?? "");
    setCalcFeedback(null);
    setCalcRevealedHints(0);

    const nextWord = data.wordProblemWork[wordProblem.id];
    setWorkMode(nextWord?.workMode ?? "write");
    setExplanationText(nextWord?.explanationText ?? "");
    setSketchDataUrl(nextWord?.sketchDataUrl ?? null);
    setWordAnswerInput(nextWord?.submittedAnswer ?? "");
    setWordFeedback(null);
    setWordRevealedHints(0);
    setWorkAiHint(null);
  }, [course.id, data.welcomeBackMode]);

  const persistWordWork = (
    overrides: Partial<{
      workMode: WorkMode;
      explanationText: string;
      sketchDataUrl: string | null;
      submittedAnswer: string;
      isCorrect: boolean | null;
    }>,
    countCheck = false
  ) => {
    saveWordProblemWork(
      course.id,
      {
        problemId: wordProblem.id,
        workMode: overrides.workMode ?? workMode,
        explanationText: overrides.explanationText ?? explanationText,
        sketchDataUrl:
          overrides.sketchDataUrl !== undefined
            ? overrides.sketchDataUrl
            : sketchDataUrl,
        submittedAnswer: overrides.submittedAnswer ?? wordAnswerInput,
        isCorrect:
          overrides.isCorrect !== undefined
            ? overrides.isCorrect
            : savedWordWork?.isCorrect ?? null,
      },
      countCheck
    );
  };

  const isCalculationStep = !data.welcomeBackMode && stepIndex === calcStepIndex;
  const isWordProblemStep = !data.welcomeBackMode && stepIndex === wordStepIndex;
  const currentQuestion =
    !isCalculationStep && !isWordProblemStep
      ? sessionQuestions[stepIndex] ??
        sessionQuestions[sessionQuestions.length - 1]
      : null;

  const savedRecord = currentQuestion
    ? data.practiceResponses[currentQuestion.id]
    : undefined;

  const activeConfidence = savedRecord?.confidence ?? pendingConfidence;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const currentUnderstanding =
    data.understandingLevels[course.id] ?? course.defaultUnderstanding;

  // Detect when a student is having a rough patch so we can offer calm encouragement
  const courseMcMisses = course.practiceQuestions.filter(
    (q) => data.practiceResponses[q.id]?.isCorrect === false
  ).length;
  const missedCurrentWithUnsure =
    Boolean(savedRecord) &&
    savedRecord?.isCorrect === false &&
    savedRecord?.confidence === "not_sure";
  const missedCalcTwice =
    Boolean(savedCalc) &&
    savedCalc.isCorrect === false &&
    savedCalc.attempts >= 2;
  const missedWord = wordFeedback?.isCorrect === false;

  const isStruggling =
    !encouragementDismissed &&
    (courseMcMisses >= 2 ||
      missedCurrentWithUnsure ||
      missedCalcTwice ||
      missedWord);

  const relevantReviewTimestamp =
    currentQuestion?.sourceTimestamp ??
    (isCalculationStep
      ? calcProblem.sourceTimestamp
      : wordProblem.sourceTimestamp);

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || !activeConfidence || savedRecord) return;
    setEncouragementDismissed(false);
    answerAdaptiveQuestion(
      course.id,
      currentQuestion,
      activeConfidence,
      option,
      mcCount
    );
  };

  const handleNext = () => {
    setPendingConfidence(null);
    if (data.welcomeBackMode) {
      exitWelcomeBackSession();
      onReturnHome();
      return;
    }
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handleTryCalmerStep = () => {
    const newLength = switchToGentleWarmup(course.id);
    setEncouragementDismissed(true);
    setPendingConfidence(null);
    if (newLength !== null) {
      const targetIdx = Math.min(mcCount - 1, Math.max(0, Number(newLength) - 1));
      setStepIndex(targetIdx);
    } else {
      setStepIndex(0);
    }
  };

  const handleCheckCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(calcInput.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(numeric)) {
      setCalcFeedback({
        isCorrect: false,
        message: "Please enter a number to check your answer.",
      });
      return;
    }

    const [minVal, maxVal] = calcProblem.acceptedRange;
    const isCorrect = numeric >= minVal && numeric <= maxVal;
    recordCo2Attempt(course.id, calcProblem.id, calcInput, isCorrect);
    if (!isCorrect) setEncouragementDismissed(false);

    if (isCorrect) {
      setCalcFeedback({
        isCorrect: true,
        message: `Correct. ${calcProblem.successExplanation}`,
      });
    } else {
      setCalcFeedback({
        isCorrect: false,
        message:
          "Not quite there yet. Use the hint steps below to double-check your steps.",
      });
    }
  };

  const handleCheckWordProblem = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(wordAnswerInput.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(numeric)) {
      setWordFeedback({
        isCorrect: false,
        message: `Please enter a number in ${wordProblem.unitLabel}.`,
      });
      return;
    }

    const [minVal, maxVal] = wordProblem.acceptedRange;
    const isCorrect = numeric >= minVal && numeric <= maxVal;
    persistWordWork({ submittedAnswer: wordAnswerInput, isCorrect }, true);
    if (!isCorrect) setEncouragementDismissed(false);

    if (isCorrect) {
      setWordFeedback({
        isCorrect: true,
        message: `Correct. ${wordProblem.successExplanation}`,
      });
    } else {
      setWordFeedback({
        isCorrect: false,
        message:
          "Not quite there yet. Check your work steps above or reveal a hint below.",
      });
    }
  };

  const handleGetWorkHint = async () => {
    if (workHintLoading) return;
    setWorkHintLoading(true);
    try {
      const res = await fetch("/api/practice/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemPrompt: wordProblem.prompt,
          studentWork: explanationText,
          hasSketch: Boolean(sketchDataUrl),
          lectureText: course.sampleLectureText,
          lecturePrefix: course.lecturePrefix,
        }),
      });
      const json = await res.json();
      setWorkAiHint({
        hint: json.hint,
        timestamp: json.timestamp,
      });
    } catch {
      setWorkAiHint({
        hint: "Break the word problem into two clear steps and check the lecture formula before calculating.",
        timestamp: wordProblem.sourceChip,
      });
    } finally {
      setWorkHintLoading(false);
    }
  };

  const handleRestart = () => {
    resetPracticeSession(course.id);
    setStepIndex(0);
    setPendingConfidence(null);
    setEncouragementDismissed(false);
    setCalcInput("");
    setCalcFeedback(null);
    setCalcRevealedHints(0);
    setExplanationText("");
    setSketchDataUrl(null);
    setWordAnswerInput("");
    setWordFeedback(null);
    setWordRevealedHints(0);
    setWorkAiHint(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-[var(--bridge-teal)]">
              {course.code} · {course.name}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight">
              {data.welcomeBackMode
                ? "Welcome back · Just 1 question today"
                : isWordProblemStep
                  ? wordProblem.title
                  : isCalculationStep
                    ? "Calculation check"
                    : `Today's 3 · Question ${stepIndex + 1} of ${mcCount}`}
            </h1>
            <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
              {data.weeklyByCourse[course.id]?.restartMode === "stretch_challenge"
                ? `This week's challenge — aim past your own ${data.weeklyByCourse[course.id].previousWeekBestPct ?? 100}% best. No timers.`
                : data.weeklyByCourse[course.id]?.restartMode === "fresh_start"
                  ? "Fresh start this week — take your time, no timers, no pressure."
                  : "This week only — take your time, no timers, no pressure."}
            </p>
          </div>
          {!settings.focusMode && (
            <button
              type="button"
              onClick={handleRestart}
              aria-label="Restart practice questions"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-xs font-medium text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)] cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div
          className="w-full h-2.5 rounded-full bg-[var(--bridge-border)] overflow-hidden"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Practice step ${stepIndex + 1} of ${totalSteps}`}
        >
          <div
            className="h-full bg-[var(--bridge-teal)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!settings.focusMode && !data.welcomeBackMode && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex(0)}
              className={`min-h-[36px] px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                !isCalculationStep && !isWordProblemStep
                  ? "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)] font-semibold"
                  : "bg-[var(--bridge-card)] border-[var(--bridge-border)] text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
              }`}
            >
              1–{mcCount}. Questions
            </button>
            <button
              type="button"
              onClick={() => setStepIndex(calcStepIndex)}
              className={`min-h-[36px] px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                isCalculationStep
                  ? "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)] font-semibold"
                  : "bg-[var(--bridge-card)] border-[var(--bridge-border)] text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
              }`}
            >
              {calcStepIndex + 1}. Calculation
            </button>
            <button
              type="button"
              onClick={() => setStepIndex(wordStepIndex)}
              className={`min-h-[36px] px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                isWordProblemStep
                  ? "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)] font-semibold"
                  : "bg-[var(--bridge-card)] border-[var(--bridge-border)] text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
              }`}
            >
              {wordStepIndex + 1}. Word problem + Show work
            </button>
          </div>
        )}
      </div>

      {/* Encouraging check-in for a struggling student */}
      {isStruggling && !settings.focusMode && (
        <section
          role="status"
          aria-label="Encouragement and support"
          className="rounded-2xl border border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] p-5 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <HeartHandshake
                className="w-5 h-5 text-[var(--bridge-teal)] mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h2 className="text-base font-semibold font-heading text-[var(--bridge-text)]">
                  Take a breath — rough patches are part of learning
                </h2>
                <p className="text-sm text-[var(--bridge-text)] leading-relaxed">
                  Missing a question does not erase the ground you have covered. It just shows the exact idea to revisit for two minutes before trying again.
                </p>
              </div>
            </div>
            <SpeakButton
              text="Take a breath, rough patches are part of learning. Missing a question does not erase the ground you have covered. It just shows the exact idea to revisit for two minutes before trying again."
              sourceId="struggle-encouragement"
              label="Read encouragement message aloud"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onJumpToLecture(relevantReviewTimestamp)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-sm font-semibold cursor-pointer"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Review {course.lecturePrefix} clip</span>
            </button>

            <button
              type="button"
              onClick={handleTryCalmerStep}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-[var(--bridge-teal)] bg-[var(--bridge-card)] text-[var(--bridge-teal)] text-sm font-semibold hover:opacity-90 cursor-pointer"
            >
              <span>Try a calmer warm-up step</span>
            </button>

            <button
              type="button"
              onClick={() => setEncouragementDismissed(true)}
              className="min-h-[44px] px-3 text-xs font-medium text-[var(--bridge-text-secondary)] underline cursor-pointer"
            >
              Keep going here
            </button>
          </div>
        </section>
      )}

      {/* Multiple-Choice Adaptive Practice Card */}
      {!isCalculationStep && !isWordProblemStep && currentQuestion && (
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold font-heading leading-snug">
              {currentQuestion.prompt}
            </h2>
            <SpeakButton
              text={`${currentQuestion.prompt} Options: ${currentQuestion.options.join(", ")}`}
              sourceId={`practice-q-${currentQuestion.id}`}
              label="Read practice question aloud"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-[var(--bridge-text-secondary)]">
              1. Before answering, how sure are you?
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={Boolean(savedRecord)}
                onClick={() => setPendingConfidence("sure")}
                aria-pressed={activeConfidence === "sure"}
                className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer disabled:cursor-default ${
                  activeConfidence === "sure"
                    ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
                }`}
              >
                Sure
              </button>
              <button
                type="button"
                disabled={Boolean(savedRecord)}
                onClick={() => setPendingConfidence("not_sure")}
                aria-pressed={activeConfidence === "not_sure"}
                className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer disabled:cursor-default ${
                  activeConfidence === "not_sure"
                    ? "bg-[var(--bridge-amber-soft)] text-[var(--bridge-amber)] border-[var(--bridge-amber)]"
                    : "bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-amber)]"
                }`}
              >
                Not sure
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-[var(--bridge-text-secondary)]">
              {activeConfidence
                ? "2. Choose your answer"
                : "2. Tap Sure or Not sure above to unlock the choices"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = savedRecord?.selectedOption === opt;
                const isRightOption = opt === currentQuestion.correctAnswer;
                const isAnswered = Boolean(savedRecord);

                let styleClass =
                  "bg-[var(--bridge-card)] border-[var(--bridge-border)] text-[var(--bridge-text)]";
                if (!activeConfidence) {
                  styleClass += " opacity-50 cursor-not-allowed";
                } else if (!isAnswered) {
                  styleClass +=
                    " hover:border-[var(--bridge-teal)] cursor-pointer";
                } else if (isRightOption) {
                  styleClass =
                    "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)] font-semibold";
                } else if (isSelected && !isRightOption) {
                  styleClass =
                    "bg-[var(--bridge-amber-soft)] border-[var(--bridge-amber)] text-[var(--bridge-amber)]";
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={!activeConfidence || isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm text-left flex items-center justify-between gap-2 transition-colors ${styleClass}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isRightOption && (
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                    {isAnswered && isSelected && !isRightOption && (
                      <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {savedRecord && (
            <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {savedRecord.isCorrect ? (
                      <>
                        <CheckCircle2
                          className="w-4 h-4 text-[var(--bridge-teal)]"
                          aria-hidden="true"
                        />
                        <span className="text-[var(--bridge-teal)]">
                          Correct
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle
                          className="w-4 h-4 text-[var(--bridge-amber)]"
                          aria-hidden="true"
                        />
                        <span className="text-[var(--bridge-amber)]">
                          Not quite — the answer is{" "}
                          {currentQuestion.correctAnswer}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-[var(--bridge-text)]">
                    {currentQuestion.explanation}
                  </p>
                </div>
                <SpeakButton
                  text={`${savedRecord.isCorrect ? "Correct." : "Not quite."} ${currentQuestion.explanation}`}
                  sourceId={`practice-feedback-${currentQuestion.id}`}
                  label="Read explanation aloud"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <TimestampChip
                  label={`Show me where · ${currentQuestion.sourceChip}`}
                  onSelect={() =>
                    onJumpToLecture(currentQuestion.sourceTimestamp)
                  }
                />

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-sm font-semibold cursor-pointer"
                >
                  <span>
                    {data.welcomeBackMode
                      ? "Done for today"
                      : stepIndex === mcCount - 1
                        ? "Next: Calculation check"
                        : "Next question"}
                  </span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Calculation Problem + 4-Step Hint Ladder */}
      {isCalculationStep && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[var(--bridge-teal)]">
                  Calculation practice
                </span>
                <h2 className="text-lg font-semibold font-heading mt-1 leading-snug">
                  {calcProblem.prompt}
                </h2>
              </div>
              <SpeakButton
                text={calcProblem.prompt}
                sourceId={`calc-problem-${calcProblem.id}`}
                label="Read calculation problem aloud"
              />
            </div>

            <form onSubmit={handleCheckCalc} className="space-y-2.5">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <label htmlFor="calc-input" className="sr-only">
                  Enter numeric answer
                </label>
                <input
                  id="calc-input"
                  type="text"
                  inputMode="decimal"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  placeholder={calcProblem.placeholder}
                  className="flex-1 min-w-[160px] min-h-[44px] px-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-bg)] text-[var(--bridge-text)] text-sm tabular-nums"
                />
                <SpeechInputButton
                  ariaLabel="Speak your numeric answer"
                  onTranscript={(transcript) => {
                    setCalcInput(parseSpokenNumber(transcript));
                    setVoiceNote(null);
                  }}
                  onUnsupported={(msg) => setVoiceNote(msg)}
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-sm font-semibold cursor-pointer shrink-0"
                >
                  Check
                </button>
              </div>
              {voiceNote && (
                <p className="text-xs text-[var(--bridge-text-secondary)]">
                  {voiceNote}
                </p>
              )}
            </form>

            {calcFeedback && (
              <div
                role="status"
                className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
                  calcFeedback.isCorrect
                    ? "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-amber-soft)] border-[var(--bridge-amber)] text-[var(--bridge-amber)]"
                }`}
              >
                <div className="flex items-start gap-2.5 text-sm font-medium">
                  {calcFeedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{calcFeedback.message}</span>
                </div>
                <SpeakButton
                  text={calcFeedback.message}
                  sourceId="calc-feedback"
                  label="Read feedback aloud"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-[var(--bridge-text-secondary)]">
                <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Bridge never gives the final answer. Graded questions get hints only.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStepIndex(wordStepIndex)}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-sm font-semibold cursor-pointer"
              >
                <span>Next: Word problem</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>

          {!settings.focusMode && (
            <HintLadderSection
              hints={calcProblem.hints}
              revealedCount={calcRevealedHints}
              onReveal={setCalcRevealedHints}
              onJumpToLecture={() =>
                onJumpToLecture(calcProblem.sourceTimestamp)
              }
            />
          )}
        </div>
      )}

      {/* Word Problem + Show Work (Words or Apple Pencil) + Understanding Scale */}
      {isWordProblemStep && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[var(--bridge-teal)]">
                  Word problem · Multi-step
                </span>
                <h2 className="text-lg font-semibold font-heading mt-1 leading-snug">
                  {wordProblem.prompt}
                </h2>
              </div>
              <SpeakButton
                text={wordProblem.prompt}
                sourceId={`word-problem-${wordProblem.id}`}
                label="Read word problem aloud"
              />
            </div>

            <ShowWorkPad
              mode={workMode}
              onModeChange={(nextMode) => {
                setWorkMode(nextMode);
                persistWordWork({ workMode: nextMode });
              }}
              explanationText={explanationText}
              onExplanationChange={(nextText) => {
                setExplanationText(nextText);
                persistWordWork({ explanationText: nextText });
              }}
              sketchDataUrl={sketchDataUrl}
              onSketchChange={(nextUrl) => {
                setSketchDataUrl(nextUrl);
                persistWordWork({ sketchDataUrl: nextUrl });
              }}
              quickSymbols={wordProblem.quickSymbols}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleGetWorkHint}
                disabled={workHintLoading}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] text-sm font-semibold hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                {workHintLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                )}
                <span>Get a hint on my work</span>
              </button>

              <span className="text-xs text-[var(--bridge-text-secondary)]">
                Checks your reasoning without spoiling the answer
              </span>
            </div>

            {workAiHint && (
              <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[var(--bridge-text)] leading-relaxed">
                    {workAiHint.hint}
                  </p>
                  <SpeakButton
                    text={workAiHint.hint}
                    sourceId="word-work-hint"
                    label="Read work hint aloud"
                  />
                </div>
                <TimestampChip
                  label={workAiHint.timestamp}
                  onSelect={() =>
                    onJumpToLecture(wordProblem.sourceTimestamp)
                  }
                />
              </div>
            )}

            <form onSubmit={handleCheckWordProblem} className="space-y-2.5 pt-1">
              <label
                htmlFor="word-answer-input"
                className="block text-xs font-medium text-[var(--bridge-text-secondary)]"
              >
                Final answer ({wordProblem.unitLabel})
              </label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <input
                  id="word-answer-input"
                  type="text"
                  inputMode="decimal"
                  value={wordAnswerInput}
                  onChange={(e) => setWordAnswerInput(e.target.value)}
                  placeholder={wordProblem.placeholder}
                  className="flex-1 min-w-[160px] min-h-[44px] px-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-bg)] text-[var(--bridge-text)] text-sm tabular-nums"
                />
                <SpeechInputButton
                  ariaLabel="Speak your final word problem answer"
                  onTranscript={(transcript) => {
                    setWordAnswerInput(parseSpokenNumber(transcript));
                    setWordVoiceNote(null);
                  }}
                  onUnsupported={(msg) => setWordVoiceNote(msg)}
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-5 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-sm font-semibold cursor-pointer shrink-0"
                >
                  Check
                </button>
              </div>
              {wordVoiceNote && (
                <p className="text-xs text-[var(--bridge-text-secondary)]">
                  {wordVoiceNote}
                </p>
              )}
            </form>

            {wordFeedback && (
              <div
                role="status"
                className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
                  wordFeedback.isCorrect
                    ? "bg-[var(--bridge-teal-soft)] border-[var(--bridge-teal)] text-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-amber-soft)] border-[var(--bridge-amber)] text-[var(--bridge-amber)]"
                }`}
              >
                <div className="flex items-start gap-2.5 text-sm font-medium">
                  {wordFeedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{wordFeedback.message}</span>
                </div>
                <SpeakButton
                  text={wordFeedback.message}
                  sourceId="word-feedback"
                  label="Read word problem feedback aloud"
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[var(--bridge-text-secondary)] pt-1">
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                Bridge never gives the final answer. Graded questions get hints only.
              </span>
            </div>
          </section>

          {!settings.focusMode && (
            <>
              <HintLadderSection
                hints={wordProblem.hints}
                revealedCount={wordRevealedHints}
                onReveal={setWordRevealedHints}
                onJumpToLecture={() =>
                  onJumpToLecture(wordProblem.sourceTimestamp)
                }
              />

              <UnderstandingScale
                value={currentUnderstanding}
                onChange={(level) => setUnderstandingLevel(course.id, level)}
                title="How well do you feel you understand this topic now?"
                subtitle="Tap a level on the scale to update your personal dashboard — only you see this."
                sourceId={`practice-understanding-${course.id}`}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HintLadderSection({
  hints,
  revealedCount,
  onReveal,
  onJumpToLecture,
}: {
  hints: { step: number; label: string; text: string; sourceChip?: string }[];
  revealedCount: number;
  onReveal: (count: number) => void;
  onJumpToLecture: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold font-heading">Hint ladder</h3>
        <span className="text-xs text-[var(--bridge-text-secondary)] tabular-nums">
          {revealedCount} of {hints.length} shown
        </span>
      </div>

      <div className="space-y-2.5">
        {hints.map((hint) => {
          const isRevealed = revealedCount >= hint.step;
          const isNextAvailable = revealedCount + 1 === hint.step;

          if (!isRevealed) {
            return (
              <button
                key={hint.step}
                type="button"
                onClick={() => onReveal(hint.step)}
                className={`w-full min-h-[44px] px-4 rounded-xl border text-sm font-medium text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isNextAvailable
                    ? "border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)]"
                    : "border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text-secondary)] hover:border-[var(--bridge-teal)]"
                }`}
              >
                <span>
                  Show hint {hint.step}: {hint.label}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            );
          }

          return (
            <div
              key={hint.step}
              className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] p-3.5 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[var(--bridge-teal)]">
                    {hint.step}. {hint.label}
                  </span>
                  <p className="text-sm text-[var(--bridge-text)]">
                    {hint.text}
                  </p>
                </div>
                <SpeakButton
                  text={`${hint.label}: ${hint.text}`}
                  sourceId={`hint-${hint.step}`}
                  label={`Read hint ${hint.step} aloud`}
                />
              </div>
              {hint.sourceChip && (
                <div>
                  <TimestampChip
                    label={hint.sourceChip}
                    onSelect={onJumpToLecture}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
