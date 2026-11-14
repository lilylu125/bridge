export type TabId = "home" | "learn" | "practice" | "me";

export type CourseId = "chem101" | "cs110" | "bus105";

export type DifficultyLevel = "Foundation" | "Core" | "Exam-level";

export type TextSizeOption = "sm" | "md" | "lg" | "xl";
export type ReadableFontOption = "default" | "atkinson" | "lexend";
export type SpacingOption = "normal" | "wide";
export type SpeechSpeed = 0.75 | 1 | 1.25;

export interface AccessibilitySettings {
  readAloudEnabled: boolean;
  speechSpeed: SpeechSpeed;
  textSize: TextSizeOption;
  readableFont: ReadableFontOption;
  spacing: SpacingOption;
  highContrast: boolean;
  darkMode: boolean;
  reduceMotion: boolean;
  focusMode: boolean;
}

export type ConfidenceLevel = "sure" | "not_sure";

export type UnderstandingLevel = 1 | 2 | 3 | 4 | 5;

export type WorkMode = "write" | "draw";

export interface PracticeQuestion {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceChip: string;
  sourceTimestamp: string;
}

export interface HintStep {
  step: number;
  label: string;
  text: string;
  sourceChip?: string;
}

export interface WordProblem {
  id: string;
  title: string;
  prompt: string;
  unitLabel: string;
  placeholder: string;
  acceptedRange: [number, number];
  successExplanation: string;
  sourceChip: string;
  sourceTimestamp: string;
  quickSymbols: string[];
  hints: HintStep[];
}

export interface CalculationProblem {
  id: string;
  prompt: string;
  placeholder: string;
  acceptedRange: [number, number];
  successExplanation: string;
  sourceChip: string;
  sourceTimestamp: string;
  hints: HintStep[];
}

export interface LectureLine {
  timestamp: string;
  chip: string;
  text: string;
}

export interface LectureChunk {
  index: number;
  total: number;
  title: string;
  timeRange: string;
  lines: LectureLine[];
}

export interface TopicReadiness {
  topic: string;
  status: "Strong" | "Shaky" | "Not reviewed";
}

export type WeekRestartMode = "clean_slate" | "fresh_start" | "stretch_challenge";

export interface WeeklyCourseState {
  dailyChecks: number[]; // Mon (0) .. Sun (6) for THIS week only
  restartMode: WeekRestartMode;
  previousWeekBestPct: number | null;
  weeklyTargetChecks: number;
}

export interface CourseConfig {
  id: CourseId;
  code: string;
  name: string;
  shortTitle: string;
  currentLectureLabel: string;
  lecturePrefix: string;
  bannerTitle: string;
  stats: {
    lecturesReviewed: string;
    upcomingLabel: string;
    upcomingValue: string;
  };
  readinessTitle: string;
  defaultUnderstanding: UnderstandingLevel;
  defaultDailyChecks: number[];
  topics: TopicReadiness[];
  sampleLectureText: string;
  defaultChunkIndex: number;
  chunks: LectureChunk[];
  practiceQuestions: PracticeQuestion[];
  calculationProblem: CalculationProblem;
  wordProblem: WordProblem;
}

export interface AskRecord {
  id: string;
  courseId: CourseId;
  question: string;
  answer: string;
  timestamps: string[];
  covered: boolean;
  createdAt: string;
}

export interface PracticeRecord {
  questionId: string;
  confidence: ConfidenceLevel;
  selectedOption: string;
  isCorrect: boolean;
}

export interface WordProblemWorkRecord {
  problemId: string;
  workMode: WorkMode;
  explanationText: string;
  sketchDataUrl: string | null;
  submittedAnswer: string;
  isCorrect: boolean | null;
}

export interface AdaptiveState {
  currentLevel: DifficultyLevel;
  consecutiveCorrect: number;
  selectedQuestionIds: string[];
}

export interface StudentDataState {
  activeCourseId: CourseId;
  currentWeekKey: string;
  weekCycleCount: number;
  lastActiveAt: string;
  simulatedDaysAway: number | null;
  welcomeBackMode: boolean;
  askHistory: AskRecord[];
  practiceResponses: Record<string, PracticeRecord>;
  adaptiveByCourse: Record<CourseId, AdaptiveState>;
  weeklyByCourse: Record<CourseId, WeeklyCourseState>;
  co2CheckStatus: Record<
    string,
    {
      submittedValue: string;
      isCorrect: boolean;
      attempts: number;
    }
  >;
  wordProblemWork: Record<string, WordProblemWorkRecord>;
  understandingLevels: Record<CourseId, UnderstandingLevel>;
  hasDeletedData: boolean;
}
