import { DifficultyLevel, PracticeQuestion } from "../types";

const LEVEL_ORDER: DifficultyLevel[] = ["Foundation", "Core", "Exam-level"];

export function stepDifficulty(
  currentLevel: DifficultyLevel,
  consecutiveCorrect: number,
  isCorrect: boolean
): { nextLevel: DifficultyLevel; nextConsecutiveCorrect: number } {
  const idx = LEVEL_ORDER.indexOf(currentLevel);

  if (isCorrect) {
    const updatedStreak = consecutiveCorrect + 1;
    if (updatedStreak >= 2) {
      const harderIdx = Math.min(LEVEL_ORDER.length - 1, idx + 1);
      return {
        nextLevel: LEVEL_ORDER[harderIdx],
        nextConsecutiveCorrect: 0,
      };
    }
    return {
      nextLevel: currentLevel,
      nextConsecutiveCorrect: updatedStreak,
    };
  }

  const easierIdx = Math.max(0, idx - 1);
  return {
    nextLevel: LEVEL_ORDER[easierIdx],
    nextConsecutiveCorrect: 0,
  };
}

export function getOneLevelBelow(level: DifficultyLevel): DifficultyLevel {
  const idx = LEVEL_ORDER.indexOf(level);
  return LEVEL_ORDER[Math.max(0, idx - 1)];
}

export function pickNextAdaptiveQuestion(
  bank: PracticeQuestion[],
  targetLevel: DifficultyLevel,
  alreadyUsedIds: string[]
): PracticeQuestion | null {
  const unused = bank.filter((q) => !alreadyUsedIds.includes(q.id));
  if (unused.length === 0) return null;

  const exactMatch = unused.find((q) => q.difficulty === targetLevel);
  if (exactMatch) return exactMatch;

  // Fallback to closest difficulty if all questions at targetLevel were already used
  const targetIdx = LEVEL_ORDER.indexOf(targetLevel);
  const sortedByProximity = [...unused].sort((a, b) => {
    const distA = Math.abs(LEVEL_ORDER.indexOf(a.difficulty) - targetIdx);
    const distB = Math.abs(LEVEL_ORDER.indexOf(b.difficulty) - targetIdx);
    return distA - distB;
  });
  return sortedByProximity[0] ?? null;
}
