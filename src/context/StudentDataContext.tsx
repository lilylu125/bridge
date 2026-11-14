import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AdaptiveState,
  AskRecord,
  ConfidenceLevel,
  CourseId,
  DifficultyLevel,
  PracticeQuestion,
  PracticeRecord,
  StudentDataState,
  UnderstandingLevel,
  WeeklyCourseState,
  WeekRestartMode,
  WordProblemWorkRecord,
} from "../types";
import {
  getOneLevelBelow,
  pickNextAdaptiveQuestion,
  stepDifficulty,
} from "../utils/adaptivePractice";
import { COURSES } from "../data/chemistryData";

const STUDENT_STORAGE_KEY = "bridge_student_v4";
const ALL_COURSE_IDS: CourseId[] = ["chem101", "cs110", "bus105"];

export function getCurrentWeekKey(date = new Date()): string {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getTodayWeekdayIndex(date = new Date()): number {
  return (date.getDay() + 6) % 7; // Mon = 0 .. Sun = 6
}

function buildInitialAdaptive(): Record<CourseId, AdaptiveState> {
  const chemFirst =
    COURSES.chem101.practiceQuestions.find((q) => q.difficulty === "Core") ??
    COURSES.chem101.practiceQuestions[0];
  const csFirst =
    COURSES.cs110.practiceQuestions.find((q) => q.difficulty === "Core") ??
    COURSES.cs110.practiceQuestions[0];
  const busFirst =
    COURSES.bus105.practiceQuestions.find((q) => q.difficulty === "Core") ??
    COURSES.bus105.practiceQuestions[0];

  return {
    chem101: {
      currentLevel: "Core",
      consecutiveCorrect: 0,
      selectedQuestionIds: [chemFirst.id],
    },
    cs110: {
      currentLevel: "Core",
      consecutiveCorrect: 0,
      selectedQuestionIds: [csFirst.id],
    },
    bus105: {
      currentLevel: "Core",
      consecutiveCorrect: 0,
      selectedQuestionIds: [busFirst.id],
    },
  };
}

function buildInitialWeekly(): Record<CourseId, WeeklyCourseState> {
  return {
    chem101: {
      dailyChecks: [...COURSES.chem101.defaultDailyChecks],
      restartMode: "clean_slate",
      previousWeekBestPct: null,
      weeklyTargetChecks: 5,
    },
    cs110: {
      dailyChecks: [...COURSES.cs110.defaultDailyChecks],
      restartMode: "clean_slate",
      previousWeekBestPct: null,
      weeklyTargetChecks: 5,
    },
    bus105: {
      dailyChecks: [...COURSES.bus105.defaultDailyChecks],
      restartMode: "clean_slate",
      previousWeekBestPct: null,
      weeklyTargetChecks: 5,
    },
  };
}

function getInitialState(): StudentDataState {
  return {
    activeCourseId: "chem101",
    currentWeekKey: getCurrentWeekKey(),
    weekCycleCount: 1,
    lastActiveAt: new Date().toISOString(),
    simulatedDaysAway: null,
    welcomeBackMode: false,
    askHistory: [],
    practiceResponses: {},
    adaptiveByCourse: buildInitialAdaptive(),
    weeklyByCourse: buildInitialWeekly(),
    co2CheckStatus: {},
    wordProblemWork: {},
    understandingLevels: {
      chem101: 4,
      cs110: 3,
      bus105: 3,
    },
    hasDeletedData: false,
  };
}

function computeNextWeekState(prev: StudentDataState): StudentDataState {
  const nextAdaptive = { ...prev.adaptiveByCourse };
  const nextWeekly = { ...prev.weeklyByCourse };

  for (const courseId of ALL_COURSE_IDS) {
    const course = COURSES[courseId];
    const bank = course.practiceQuestions;
    const prevWeeklyState = prev.weeklyByCourse[courseId];

    let correctCount = 0;
    let missCount = 0;

    for (const q of bank) {
      const resp = prev.practiceResponses[q.id];
      if (resp) {
        if (resp.isCorrect) correctCount += 1;
        else missCount += 1;
      }
    }

    const calcStatus = prev.co2CheckStatus[course.calculationProblem.id];
    if (calcStatus) {
      if (calcStatus.isCorrect) correctCount += 1;
      else missCount += 1;
    }

    const wordStatus = prev.wordProblemWork[course.wordProblem.id];
    if (wordStatus && wordStatus.isCorrect !== null) {
      if (wordStatus.isCorrect) correctCount += 1;
      else missCount += 1;
    }

    const answeredCount = correctCount + missCount;
    const accuracyPct =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

    let restartMode: WeekRestartMode = "clean_slate";
    let startingLevel: DifficultyLevel = "Core";
    let previousWeekBestPct = prevWeeklyState.previousWeekBestPct;
    let weeklyTargetChecks = 5;

    if (answeredCount > 0 && (missCount >= 2 || (accuracyPct !== null && accuracyPct < 60))) {
      restartMode = "fresh_start";
      startingLevel = "Foundation";
      weeklyTargetChecks = 4;
    } else if (
      answeredCount >= 2 &&
      (missCount === 0 || (accuracyPct !== null && accuracyPct >= 85))
    ) {
      restartMode = "stretch_challenge";
      startingLevel = "Exam-level";
      previousWeekBestPct = Math.max(
        prevWeeklyState.previousWeekBestPct ?? 0,
        accuracyPct ?? 100
      );
      weeklyTargetChecks = Math.min(10, prevWeeklyState.weeklyTargetChecks + 1);
    } else {
      restartMode = "clean_slate";
      startingLevel = "Core";
      if (accuracyPct !== null) {
        previousWeekBestPct = Math.max(
          prevWeeklyState.previousWeekBestPct ?? 0,
          accuracyPct
        );
      }
      weeklyTargetChecks = 5;
    }

    const firstQ =
      pickNextAdaptiveQuestion(bank, startingLevel, []) ?? bank[0];

    nextAdaptive[courseId] = {
      currentLevel: startingLevel,
      consecutiveCorrect: 0,
      selectedQuestionIds: [firstQ.id],
    };

    nextWeekly[courseId] = {
      dailyChecks: [0, 0, 0, 0, 0, 0, 0],
      restartMode,
      previousWeekBestPct,
      weeklyTargetChecks,
    };
  }

  return {
    ...prev,
    currentWeekKey: getCurrentWeekKey(),
    weekCycleCount: prev.weekCycleCount + 1,
    welcomeBackMode: false,
    practiceResponses: {},
    co2CheckStatus: {},
    wordProblemWork: {},
    adaptiveByCourse: nextAdaptive,
    weeklyByCourse: nextWeekly,
  };
}

interface StudentDataContextValue {
  data: StudentDataState;
  isAway7PlusDays: boolean;
  setActiveCourse: (courseId: CourseId) => void;
  setSimulatedDaysAway: (days: number | null) => void;
  startWelcomeBackSession: () => void;
  exitWelcomeBackSession: () => void;
  startNewWeek: () => void;
  setUnderstandingLevel: (
    courseId: CourseId,
    level: UnderstandingLevel
  ) => void;
  addAskRecord: (record: AskRecord) => void;
  answerAdaptiveQuestion: (
    courseId: CourseId,
    question: PracticeQuestion,
    confidence: ConfidenceLevel,
    selectedOption: string,
    totalSessionMcSlots: number
  ) => void;
  recordCo2Attempt: (
    courseId: CourseId,
    problemId: string,
    submittedValue: string,
    isCorrect: boolean
  ) => void;
  saveWordProblemWork: (
    courseId: CourseId,
    record: WordProblemWorkRecord,
    countCheck?: boolean
  ) => void;
  switchToGentleWarmup: (courseId: CourseId) => number | null;
  resetPracticeSession: (courseId?: CourseId) => void;
  deleteEverything: () => void;
}

const StudentDataContext = createContext<StudentDataContextValue | null>(null);

function loadStudentData(): StudentDataState {
  const initial = getInitialState();
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    const merged: StudentDataState = {
      ...initial,
      ...parsed,
      adaptiveByCourse: {
        ...initial.adaptiveByCourse,
        ...(parsed.adaptiveByCourse ?? {}),
      },
      weeklyByCourse: {
        ...initial.weeklyByCourse,
        ...(parsed.weeklyByCourse ?? {}),
      },
      understandingLevels: {
        ...initial.understandingLevels,
        ...(parsed.understandingLevels ?? {}),
      },
    };

    const actualWeekKey = getCurrentWeekKey();
    if (merged.currentWeekKey !== actualWeekKey) {
      return computeNextWeekState(merged);
    }

    return merged;
  } catch {
    return initial;
  }
}

export function StudentDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<StudentDataState>(loadStudentData);

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }, [data]);

  const isAway7PlusDays =
    data.simulatedDaysAway !== null
      ? data.simulatedDaysAway >= 7
      : Date.now() - new Date(data.lastActiveAt).getTime() >= 7 * 86400_000;

  const setActiveCourse = useCallback((courseId: CourseId) => {
    setData((prev) => ({
      ...prev,
      activeCourseId: courseId,
    }));
  }, []);

  const setSimulatedDaysAway = useCallback((days: number | null) => {
    setData((prev) => ({
      ...prev,
      simulatedDaysAway: days,
    }));
  }, []);

  const startWelcomeBackSession = useCallback(() => {
    setData((prev) => {
      const courseId = prev.activeCourseId;
      const bank = COURSES[courseId].practiceQuestions;
      const current = prev.adaptiveByCourse[courseId];
      const gentlerLevel = getOneLevelBelow(current.currentLevel);
      const picked =
        pickNextAdaptiveQuestion(bank, gentlerLevel, []) ?? bank[0];

      const clearedResponses = { ...prev.practiceResponses };
      delete clearedResponses[picked.id];

      return {
        ...prev,
        welcomeBackMode: true,
        practiceResponses: clearedResponses,
        adaptiveByCourse: {
          ...prev.adaptiveByCourse,
          [courseId]: {
            ...current,
            selectedQuestionIds: [picked.id],
          },
        },
      };
    });
  }, []);

  const exitWelcomeBackSession = useCallback(() => {
    setData((prev) => ({
      ...prev,
      welcomeBackMode: false,
      simulatedDaysAway: null,
      lastActiveAt: new Date().toISOString(),
    }));
  }, []);

  const startNewWeek = useCallback(() => {
    setData((prev) => computeNextWeekState(prev));
  }, []);

  const setUnderstandingLevel = useCallback(
    (courseId: CourseId, level: UnderstandingLevel) => {
      setData((prev) => ({
        ...prev,
        hasDeletedData: false,
        understandingLevels: {
          ...prev.understandingLevels,
          [courseId]: level,
        },
      }));
    },
    []
  );

  const addAskRecord = useCallback((record: AskRecord) => {
    setData((prev) => ({
      ...prev,
      hasDeletedData: false,
      askHistory: [record, ...prev.askHistory],
    }));
  }, []);

  const answerAdaptiveQuestion = useCallback(
    (
      courseId: CourseId,
      question: PracticeQuestion,
      confidence: ConfidenceLevel,
      selectedOption: string,
      totalSessionMcSlots: number
    ) => {
      setData((prev) => {
        const isCorrect = selectedOption === question.correctAnswer;
        const record: PracticeRecord = {
          questionId: question.id,
          confidence,
          selectedOption,
          isCorrect,
        };

        const currentAdaptive = prev.adaptiveByCourse[courseId];
        const { nextLevel, nextConsecutiveCorrect } = stepDifficulty(
          currentAdaptive.currentLevel,
          currentAdaptive.consecutiveCorrect,
          isCorrect
        );

        let nextIds = [...currentAdaptive.selectedQuestionIds];
        const bank = COURSES[courseId].practiceQuestions;

        if (!prev.welcomeBackMode && nextIds.length < totalSessionMcSlots) {
          const isSelectingLastQuestion =
            nextIds.length === totalSessionMcSlots - 1;
          const targetLevel = isSelectingLastQuestion
            ? getOneLevelBelow(nextLevel)
            : nextLevel;
          const nextQ = pickNextAdaptiveQuestion(bank, targetLevel, nextIds);
          if (nextQ) {
            nextIds = [...nextIds, nextQ.id];
          }
        }

        const todayIdx = getTodayWeekdayIndex();
        const prevWeekly = prev.weeklyByCourse[courseId];
        const nextDaily = [...prevWeekly.dailyChecks];
        nextDaily[todayIdx] = (nextDaily[todayIdx] ?? 0) + 1;

        return {
          ...prev,
          hasDeletedData: false,
          lastActiveAt: new Date().toISOString(),
          simulatedDaysAway: prev.welcomeBackMode ? null : prev.simulatedDaysAway,
          practiceResponses: {
            ...prev.practiceResponses,
            [question.id]: record,
          },
          adaptiveByCourse: {
            ...prev.adaptiveByCourse,
            [courseId]: {
              currentLevel: nextLevel,
              consecutiveCorrect: nextConsecutiveCorrect,
              selectedQuestionIds: nextIds,
            },
          },
          weeklyByCourse: {
            ...prev.weeklyByCourse,
            [courseId]: {
              ...prevWeekly,
              dailyChecks: nextDaily,
            },
          },
        };
      });
    },
    []
  );

  const recordCo2Attempt = useCallback(
    (
      courseId: CourseId,
      problemId: string,
      submittedValue: string,
      isCorrect: boolean
    ) => {
      setData((prev) => {
        const todayIdx = getTodayWeekdayIndex();
        const prevWeekly = prev.weeklyByCourse[courseId];
        const nextDaily = [...prevWeekly.dailyChecks];
        if (!prev.co2CheckStatus[problemId]) {
          nextDaily[todayIdx] = (nextDaily[todayIdx] ?? 0) + 1;
        }

        return {
          ...prev,
          hasDeletedData: false,
          lastActiveAt: new Date().toISOString(),
          co2CheckStatus: {
            ...prev.co2CheckStatus,
            [problemId]: {
              submittedValue,
              isCorrect,
              attempts: (prev.co2CheckStatus[problemId]?.attempts ?? 0) + 1,
            },
          },
          weeklyByCourse: {
            ...prev.weeklyByCourse,
            [courseId]: {
              ...prevWeekly,
              dailyChecks: nextDaily,
            },
          },
        };
      });
    },
    []
  );

  const saveWordProblemWork = useCallback(
    (courseId: CourseId, record: WordProblemWorkRecord, countCheck = false) => {
      setData((prev) => {
        const todayIdx = getTodayWeekdayIndex();
        const prevWeekly = prev.weeklyByCourse[courseId];
        const nextDaily = [...prevWeekly.dailyChecks];
        const alreadySubmitted =
          prev.wordProblemWork[record.problemId]?.isCorrect !== null &&
          prev.wordProblemWork[record.problemId]?.isCorrect !== undefined;

        if (countCheck && !alreadySubmitted && record.isCorrect !== null) {
          nextDaily[todayIdx] = (nextDaily[todayIdx] ?? 0) + 1;
        }

        return {
          ...prev,
          hasDeletedData: false,
          wordProblemWork: {
            ...prev.wordProblemWork,
            [record.problemId]: record,
          },
          weeklyByCourse: {
            ...prev.weeklyByCourse,
            [courseId]: {
              ...prevWeekly,
              dailyChecks: nextDaily,
            },
          },
        };
      });
    },
    []
  );

  const switchToGentleWarmup = useCallback(
    (courseId: CourseId): number | null => {
      const bank = COURSES[courseId].practiceQuestions;
      const current = data.adaptiveByCourse[courseId];
      const foundationQuestions = bank.filter(
        (q) => q.difficulty === "Foundation"
      );

      const warmupQ =
        foundationQuestions.find(
          (q) =>
            !current.selectedQuestionIds.includes(q.id) &&
            !data.practiceResponses[q.id]
        ) ??
        pickNextAdaptiveQuestion(
          bank,
          "Foundation",
          current.selectedQuestionIds
        ) ??
        foundationQuestions.find(
          (q) =>
            q.id !==
            current.selectedQuestionIds[current.selectedQuestionIds.length - 1]
        ) ??
        foundationQuestions[0] ??
        bank[0];

      if (!warmupQ) return null;

      let nextIds: string[];
      if (data.welcomeBackMode) {
        nextIds = [warmupQ.id];
      } else if (current.selectedQuestionIds.length < 3) {
        nextIds = [
          ...current.selectedQuestionIds.filter((id) => id !== warmupQ.id),
          warmupQ.id,
        ];
      } else {
        nextIds = [
          ...current.selectedQuestionIds
            .slice(0, 2)
            .filter((id) => id !== warmupQ.id),
          warmupQ.id,
        ];
      }

      setData((prev) => {
        const updatedResponses = { ...prev.practiceResponses };
        delete updatedResponses[warmupQ.id];

        return {
          ...prev,
          hasDeletedData: false,
          practiceResponses: updatedResponses,
          adaptiveByCourse: {
            ...prev.adaptiveByCourse,
            [courseId]: {
              currentLevel: "Foundation",
              consecutiveCorrect: 0,
              selectedQuestionIds: nextIds,
            },
          },
        };
      });

      return nextIds.length;
    },
    [data.adaptiveByCourse, data.practiceResponses, data.welcomeBackMode]
  );

  const resetPracticeSession = useCallback((courseId?: CourseId) => {
    setData((prev) => {
      const targetCourse = courseId ?? prev.activeCourseId;
      const bank = COURSES[targetCourse].practiceQuestions;
      const restartMode = prev.weeklyByCourse[targetCourse].restartMode;
      const startLevel: DifficultyLevel =
        restartMode === "fresh_start"
          ? "Foundation"
          : restartMode === "stretch_challenge"
            ? "Exam-level"
            : "Core";

      const firstQ =
        pickNextAdaptiveQuestion(bank, startLevel, []) ?? bank[0];

      const updatedResponses = { ...prev.practiceResponses };
      for (const q of bank) {
        delete updatedResponses[q.id];
      }

      return {
        ...prev,
        welcomeBackMode: false,
        practiceResponses: updatedResponses,
        adaptiveByCourse: {
          ...prev.adaptiveByCourse,
          [targetCourse]: {
            currentLevel: startLevel,
            consecutiveCorrect: 0,
            selectedQuestionIds: [firstQ.id],
          },
        },
      };
    });
  }, []);

  const deleteEverything = useCallback(() => {
    try {
      localStorage.removeItem(STUDENT_STORAGE_KEY);
      localStorage.removeItem("bridge_student_v3");
      localStorage.removeItem("bridge_student_v2");
      localStorage.removeItem("bridge_student_v1");
    } catch {
      // Ignore
    }
    setData({
      ...getInitialState(),
      hasDeletedData: true,
    });
  }, []);

  return (
    <StudentDataContext.Provider
      value={{
        data,
        isAway7PlusDays,
        setActiveCourse,
        setSimulatedDaysAway,
        startWelcomeBackSession,
        exitWelcomeBackSession,
        startNewWeek,
        setUnderstandingLevel,
        addAskRecord,
        answerAdaptiveQuestion,
        recordCo2Attempt,
        saveWordProblemWork,
        switchToGentleWarmup,
        resetPracticeSession,
        deleteEverything,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const ctx = useContext(StudentDataContext);
  if (!ctx) {
    throw new Error("useStudentData must be used inside StudentDataProvider");
  }
  return ctx;
}
