import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  ShieldCheck,
  FlaskConical,
  Code2,
  Briefcase,
  Compass,
  RefreshCw,
  CalendarPlus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COURSE_LIST, getCourseById } from "../data/chemistryData";
import { SpeakButton } from "../components/SpeakButton";
import { UnderstandingScale } from "../components/UnderstandingScale";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  getTodayWeekdayIndex,
  useStudentData,
} from "../context/StudentDataContext";
import { CourseId, TopicReadiness } from "../types";

interface WeeklyAnalysisResult {
  summary: string;
  motivation: string;
  suggestion: string;
  recommendedAction: "learn" | "practice";
  actionLabel: string;
}

interface HomeScreenProps {
  onStartPractice: () => void;
  onStartWelcomeBack: () => void;
  onReviewLecture: () => void;
}

const WEEKDAY_LABELS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

function getCourseIcon(courseId: CourseId) {
  switch (courseId) {
    case "chem101":
      return FlaskConical;
    case "cs110":
      return Code2;
    case "bus105":
      return Briefcase;
  }
}

export function HomeScreen({
  onStartPractice,
  onStartWelcomeBack,
  onReviewLecture,
}: HomeScreenProps) {
  const { settings } = useAccessibility();
  const {
    data,
    isAway7PlusDays,
    setActiveCourse,
    setUnderstandingLevel,
    setSimulatedDaysAway,
    startNewWeek,
  } = useStudentData();

  const activeCourse = getCourseById(data.activeCourseId);
  const currentUnderstanding =
    data.understandingLevels[activeCourse.id] ??
    activeCourse.defaultUnderstanding;

  const weeklyState = data.weeklyByCourse[activeCourse.id];
  const todayIdx = getTodayWeekdayIndex();
  const dailyChartData = WEEKDAY_LABELS.map((day, index) => ({
    day: day.full,
    shortLabel: day.short,
    checks: weeklyState.dailyChecks[index] ?? 0,
    isToday: index === todayIdx,
  }));
  const thisWeekChecks = weeklyState.dailyChecks.reduce(
    (sum, val) => sum + val,
    0
  );

  // Compute live "this week" MC + Calc + Word metrics
  const courseMcResponses = activeCourse.practiceQuestions
    .map((q) => data.practiceResponses[q.id])
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const mcMisses = courseMcResponses.filter((r) => !r.isCorrect).length;
  const mcCorrect = courseMcResponses.filter((r) => r.isCorrect).length;

  const calcRecord = data.co2CheckStatus[activeCourse.calculationProblem.id];
  const wordRecord = data.wordProblemWork[activeCourse.wordProblem.id];

  const recentMisses =
    mcMisses +
    (calcRecord && !calcRecord.isCorrect ? 1 : 0) +
    (wordRecord && wordRecord.isCorrect === false ? 1 : 0);
  const recentCorrect =
    mcCorrect +
    (calcRecord?.isCorrect ? 1 : 0) +
    (wordRecord?.isCorrect === true ? 1 : 0);

  const sureResponses = courseMcResponses.filter(
    (r) => r.confidence === "sure"
  );
  const sureAndRightDisplay =
    sureResponses.length > 0
      ? `${Math.round(
          (sureResponses.filter((r) => r.isCorrect).length /
            sureResponses.length) *
            100
        )}%`
      : "—";
  const sureAndRightDetail =
    sureResponses.length > 0 ? "This week" : "No checks yet";

  const [analysis, setAnalysis] = useState<WeeklyAnalysisResult>(() => ({
    summary: `In ${activeCourse.name} this week, you have ${thisWeekChecks} of ${weeklyState.weeklyTargetChecks} checks logged.`,
    motivation:
      "Each week starts fresh—every small step you take this week builds momentum without carrying old misses forward.",
    suggestion: `Spend 5 calm minutes reviewing ${activeCourse.topics.find((t) => t.status === "Shaky")?.topic ?? activeCourse.shortTitle} in ${activeCourse.currentLectureLabel}.`,
    recommendedAction: "learn",
    actionLabel: `Review ${activeCourse.currentLectureLabel}`,
  }));
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const fetchWeeklyAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/weekly-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: activeCourse.name,
          lectureLabel: activeCourse.currentLectureLabel,
          thisWeekChecks,
          weeklyTargetChecks: weeklyState.weeklyTargetChecks,
          restartMode: weeklyState.restartMode,
          previousWeekBestPct: weeklyState.previousWeekBestPct,
          strongTopics: activeCourse.topics
            .filter((t) => t.status === "Strong")
            .map((t) => t.topic),
          shakyTopics: activeCourse.topics
            .filter((t) => t.status === "Shaky")
            .map((t) => t.topic),
          understandingLevel: currentUnderstanding,
          recentMisses,
          recentCorrect,
        }),
      });
      const json = await res.json();
      if (json?.summary && json?.motivation && json?.suggestion) {
        setAnalysis(json);
      }
    } catch {
      // Keep calm pre-populated fallback
    } finally {
      setAnalysisLoading(false);
    }
  }, [
    activeCourse,
    currentUnderstanding,
    recentCorrect,
    recentMisses,
    thisWeekChecks,
    weeklyState.previousWeekBestPct,
    weeklyState.restartMode,
    weeklyState.weeklyTargetChecks,
  ]);

  useEffect(() => {
    fetchWeeklyAnalysis();
  }, [activeCourse.id, data.weekCycleCount]);

  const tealColor = settings.highContrast
    ? settings.darkMode
      ? "#5CE1DB"
      : "#064E4B"
    : settings.darkMode
      ? "#4FD1CB"
      : "#0E6E6B";

  const mutedBarColor = settings.highContrast
    ? settings.darkMode
      ? "#5C6B68"
      : "#6C7875"
    : settings.darkMode
      ? "#324441"
      : "#C8D4D1";

  const axisColor = settings.darkMode ? "#B0BEBB" : "#55615F";
  const gridColor = settings.darkMode ? "#2C3B39" : "#DCE2DF";

  const weekModeTitle =
    weeklyState.restartMode === "fresh_start"
      ? "New week, fresh start"
      : weeklyState.restartMode === "stretch_challenge"
        ? "New week, higher bar"
        : "This week only · Fresh every week";

  const weekModeDescription =
    weeklyState.restartMode === "fresh_start"
      ? "Last week's misses are cleared. Only this week counts — start steady at your own pace."
      : weeklyState.restartMode === "stretch_challenge"
        ? `You hit ${weeklyState.previousWeekBestPct ?? 100}% last week. This week starts with sharper problems to push your personal best further.`
        : "Every week resets to a clean slate—giving struggling learners a fresh start and raising the bar when you do well.";

  const mainHeroText = isAway7PlusDays
    ? "Hi Maya. Welcome back. Just 1 question today."
    : `Hi Maya. ${activeCourse.bannerTitle}. Start today's 3.`;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
            Hi Maya
          </h1>
          <p className="text-sm text-[var(--bridge-text-secondary)] mt-0.5">
            {activeCourse.code} · {activeCourse.name} · This week (Week{" "}
            {data.weekCycleCount})
          </p>
        </div>
        <SpeakButton
          text={mainHeroText}
          sourceId="home-greeting"
          label="Read greeting and today's focus aloud"
        />
      </div>

      {/* Welcome back card — shown ONLY when student has been away 7+ days */}
      {isAway7PlusDays && (
        <section
          aria-label="Welcome back"
          className="rounded-2xl border border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold font-heading text-[var(--bridge-text)]">
              Welcome back. Just 1 question today.
            </h2>
            <p className="text-sm text-[var(--bridge-text-secondary)]">
              Ease back in at your own pace.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartWelcomeBack}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Start</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </section>
      )}

      {/* Primary Action Card */}
      <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--bridge-teal)]">
              Today&apos;s step · {activeCourse.code}
            </p>
            <h2 className="text-lg sm:text-xl font-semibold font-heading leading-snug">
              {activeCourse.bannerTitle}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onStartPractice}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Start today&apos;s 3</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Fresh Restart & Personal Challenge Card */}
      <section
        aria-label="Weekly restart"
        className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          weeklyState.restartMode === "fresh_start" ||
          weeklyState.restartMode === "stretch_challenge"
            ? "border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)]/70"
            : "border-[var(--bridge-border)] bg-[var(--bridge-card)]"
        }`}
      >
        <div className="space-y-1">
          <h2 className="text-base font-semibold font-heading text-[var(--bridge-text)]">
            {weekModeTitle}
          </h2>
          <p className="text-sm text-[var(--bridge-text-secondary)]">
            {weekModeDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={startNewWeek}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-[var(--bridge-teal)] bg-[var(--bridge-card)] hover:bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <CalendarPlus className="w-4 h-4" aria-hidden="true" />
            <span>Start new week</span>
          </button>
          <SpeakButton
            text={`${weekModeTitle}. ${weekModeDescription}`}
            sourceId="home-weekly-reset"
            label="Read weekly restart note aloud"
          />
        </div>
      </section>

      {/* Separate Course Boxes (Intro Chemistry, Computer Science, Business) */}
      <section aria-label="Your courses" className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold font-heading">
            Your courses
          </h2>
          <span className="text-xs text-[var(--bridge-text-secondary)]">
            Select a course box to switch content
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COURSE_LIST.map((course) => {
            const Icon = getCourseIcon(course.id);
            const isSelected = course.id === activeCourse.id;
            const courseUnderstanding =
              data.understandingLevels[course.id] ?? course.defaultUnderstanding;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setActiveCourse(course.id)}
                aria-pressed={isSelected}
                className={`rounded-2xl border p-4 text-left flex flex-col justify-between gap-3 transition-colors cursor-pointer min-h-[136px] ${
                  isSelected
                    ? "border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)]/50"
                    : "border-[var(--bridge-border)] bg-[var(--bridge-card)] hover:border-[var(--bridge-teal)]"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--bridge-teal)]">
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{course.code}</span>
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)]"
                          : "bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text-secondary)]"
                      }`}
                    >
                      {isSelected ? "Active" : "Switch"}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold font-heading text-[var(--bridge-text)]">
                    {course.name}
                  </h3>
                  <p className="text-xs text-[var(--bridge-text-secondary)]">
                    {course.currentLectureLabel} · {course.shortTitle}
                  </p>
                </div>

                <UnderstandingScale value={courseUnderstanding} compact />
              </button>
            );
          })}
        </div>
      </section>

      {/* 2x2 Stat Grid — This week only */}
      <section
        aria-label="This week's study snapshot"
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        <StatTile
          label="Lectures reviewed"
          value={activeCourse.stats.lecturesReviewed}
        />
        <StatTile
          label="This week's checks"
          value={`${thisWeekChecks} of ${weeklyState.weeklyTargetChecks}`}
          detail={
            weeklyState.previousWeekBestPct !== null
              ? `Goal: beat ${weeklyState.previousWeekBestPct}%`
              : "This week only"
          }
          highlight
        />
        <StatTile
          label="Sure and right"
          value={sureAndRightDisplay}
          detail={sureAndRightDetail}
        />
        <StatTile
          label={activeCourse.stats.upcomingLabel}
          value={activeCourse.stats.upcomingValue}
        />
      </section>

      {/* AI Weekly Reflection & Next-Step Suggestion */}
      <section
        aria-label="This week's reflection"
        className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 space-y-3.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Compass
              className="w-5 h-5 text-[var(--bridge-teal)] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-base font-semibold font-heading">
                This week&apos;s reflection
              </h2>
              <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
                Focused only on this week and your own pace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchWeeklyAnalysis}
              disabled={analysisLoading}
              aria-label="Refresh weekly reflection"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] text-xs font-medium text-[var(--bridge-text)] hover:border-[var(--bridge-teal)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${analysisLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </button>
            <SpeakButton
              text={`${analysis.summary} ${analysis.motivation} Suggestion: ${analysis.suggestion}`}
              sourceId="home-weekly-analysis"
              label="Read weekly reflection aloud"
            />
          </div>
        </div>

        <div className="space-y-2.5 text-sm leading-relaxed">
          <p className="text-[var(--bridge-text)]">{analysis.summary}</p>
          <p className="text-[var(--bridge-teal)] font-medium">
            {analysis.motivation}
          </p>
          <div className="rounded-xl bg-[var(--bridge-surface-subtle)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[var(--bridge-text)]">
              <span className="font-semibold">Next step:</span>{" "}
              {analysis.suggestion}
            </p>
            <button
              type="button"
              onClick={
                analysis.recommendedAction === "practice"
                  ? onStartPractice
                  : onReviewLecture
              }
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-[var(--bridge-teal-solid)] hover:bg-[var(--bridge-teal-hover)] text-[var(--bridge-on-teal)] text-xs font-semibold whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>{analysis.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Level of Understanding Scale */}
      <UnderstandingScale
        value={currentUnderstanding}
        onChange={(level) => setUnderstandingLevel(activeCourse.id, level)}
        title={`Level of understanding · ${activeCourse.shortTitle}`}
        sourceId={`home-understanding-${activeCourse.id}`}
      />

      {/* Recharts Bar Chart (This week only) + Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold font-heading">
                This week&apos;s check-ins
              </h2>
              <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
                Only this week (Mon–Sun) · resets every new week
              </p>
            </div>
            <SpeakButton
              text={`This week's check-ins for ${activeCourse.name}: ${dailyChartData.map((d) => `${d.day} ${d.checks}`).join(", ")}. Total ${thisWeekChecks} of ${weeklyState.weeklyTargetChecks}.`}
              sourceId="home-chart"
              label="Read this week's check-ins aloud"
            />
          </div>

          <div
            className="h-52 w-full"
            aria-label="Bar chart showing practice check-ins completed this week from Monday to Sunday"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyChartData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => [`${value}`, "Checks"]}
                  labelFormatter={(label) =>
                    dailyChartData.find((d) => d.shortLabel === label)?.day ??
                    label
                  }
                  contentStyle={{
                    backgroundColor: settings.darkMode ? "#182221" : "#FFFFFF",
                    borderColor: settings.darkMode ? "#2C3B39" : "#DCE2DF",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: settings.darkMode ? "#F0F4F3" : "#16201F",
                  }}
                />
                <Bar dataKey="checks" radius={[8, 8, 0, 0]} maxBarSize={38}>
                  {dailyChartData.map((entry) => (
                    <Cell
                      key={entry.shortLabel}
                      fill={entry.isToday ? tealColor : mutedBarColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[var(--bridge-text-secondary)] mt-3">
            Today is highlighted in teal — every new week clears this chart to zero.
          </p>
        </section>

        {/* Readiness Card */}
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-semibold font-heading">
                  {activeCourse.readinessTitle}
                </h2>
                <p className="text-xs text-[var(--bridge-text-secondary)] mt-0.5">
                  Based on your own recall checks
                </p>
              </div>
              <SpeakButton
                text={`${activeCourse.readinessTitle}: ${activeCourse.topics.map((t) => `${t.topic} is ${t.status}`).join(". ")}.`}
                sourceId="home-readiness"
                label="Read readiness topics aloud"
              />
            </div>

            <ul className="divide-y divide-[var(--bridge-border)]">
              {activeCourse.topics.map((item) => (
                <li
                  key={item.topic}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium">{item.topic}</span>
                  <TopicStatusChip status={item.status} />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onReviewLecture}
            className="mt-4 w-full min-h-[44px] px-4 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] hover:border-[var(--bridge-teal)] text-sm font-medium text-[var(--bridge-text)] cursor-pointer transition-colors"
          >
            Review {activeCourse.currentLectureLabel} chunks
          </button>
        </section>
      </div>

      {/* Privacy & No-Questions Trust Card */}
      <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="w-5 h-5 text-[var(--bridge-teal)] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--bridge-text)]">
            We never ask about you. Bridge adapts to what you do.
          </p>
        </div>
        <SpeakButton
          text="We never ask about you. Bridge adapts to what you do."
          sourceId="home-trust"
          label="Read privacy note aloud"
        />
      </section>

      {/* Demo Data Footer with subtle 7+ days away preview toggle */}
      <footer className="pt-1 pb-2 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--bridge-text-secondary)]">
        <span>Demo data</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setSimulatedDaysAway(isAway7PlusDays ? null : 7)}
          className="underline hover:text-[var(--bridge-teal)] cursor-pointer min-h-[36px] px-1"
        >
          {isAway7PlusDays
            ? "Return to active today"
            : "Preview 7+ days away"}
        </button>
      </footer>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-4 flex flex-col justify-between gap-1.5">
      <span className="text-xs text-[var(--bridge-text-secondary)]">{label}</span>
      <div>
        <span
          className={`text-xl sm:text-2xl font-bold font-heading tabular-nums ${
            highlight ? "text-[var(--bridge-teal)]" : "text-[var(--bridge-text)]"
          }`}
        >
          {value}
        </span>
        {detail && (
          <span className="block text-xs font-medium text-[var(--bridge-teal)] mt-0.5">
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}

function TopicStatusChip({ status }: { status: TopicReadiness["status"] }) {
  if (status === "Strong") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] text-xs font-semibold shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Strong</span>
      </span>
    );
  }
  if (status === "Shaky") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bridge-amber-soft)] text-[var(--bridge-amber)] text-xs font-semibold shrink-0">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Shaky</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bridge-grey-soft)] text-[var(--bridge-text-secondary)] text-xs font-semibold shrink-0">
      <MinusCircle className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Not reviewed</span>
    </span>
  );
}
