import { useMemo, useState } from "react";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { StudentDataProvider, useStudentData } from "./context/StudentDataContext";
import { NavigationShell } from "./components/NavigationShell";
import { AccessibilityDrawer } from "./components/AccessibilityDrawer";
import { HomeScreen } from "./screens/HomeScreen";
import { LearnScreen } from "./screens/LearnScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { MeScreen } from "./screens/MeScreen";
import { TabId } from "./types";
import { getCourseById } from "./data/chemistryData";

function BridgeAppContent() {
  const { data, startWelcomeBackSession, resetPracticeSession } = useStudentData();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [a11yOpen, setA11yOpen] = useState(false);
  const [highlightedTimestamp, setHighlightedTimestamp] = useState<string | null>(
    null
  );

  const course = getCourseById(data.activeCourseId);

  const weeklyState = data.weeklyByCourse[course.id];
  const thisWeekChecks = weeklyState.dailyChecks.reduce((s, n) => s + n, 0);

  const screenMainText = useMemo(() => {
    switch (activeTab) {
      case "home":
        return `Hi Maya. ${course.bannerTitle}. Lectures reviewed: ${course.stats.lecturesReviewed}. This week's checks: ${thisWeekChecks} of ${weeklyState.weeklyTargetChecks}. ${course.stats.upcomingLabel} is ${course.stats.upcomingValue}. Every week starts fresh. We never ask about you.`;
      case "learn":
        return `${course.lecturePrefix}. ${course.sampleLectureText.replace(/\[\d{2}:\d{2}\]\s*/g, "")}`;
      case "practice":
        return `Practice for ${course.name}. ${course.practiceQuestions[0].prompt}`;
      case "me":
        return "Only you can see this. Instructors see class-wide patterns only, 10 or more students. Every week clears old misses for a fresh start and raises the bar after a strong week. Questions get harder after 2 right in a row and easier after a miss. What we store: this week's answers, Sure and Not sure taps, settings, Ask questions. What we never store: diagnoses, disabilities, or guesses about you.";
    }
  }, [activeTab, course, thisWeekChecks, weeklyState.weeklyTargetChecks]);

  const handleJumpToLecture = (timestamp: string) => {
    setHighlightedTimestamp(timestamp);
    setActiveTab("learn");
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <NavigationShell
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0 });
        }}
        onOpenA11y={() => setA11yOpen(true)}
      >
        {activeTab === "home" && (
          <HomeScreen
            onStartPractice={() => {
              if (data.welcomeBackMode) {
                resetPracticeSession(course.id);
              }
              setActiveTab("practice");
              window.scrollTo({ top: 0 });
            }}
            onStartWelcomeBack={() => {
              startWelcomeBackSession();
              setActiveTab("practice");
              window.scrollTo({ top: 0 });
            }}
            onReviewLecture={() => {
              setActiveTab("learn");
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {activeTab === "learn" && (
          <LearnScreen
            highlightedTimestamp={highlightedTimestamp}
            onClearHighlight={() => setHighlightedTimestamp(null)}
          />
        )}

        {activeTab === "practice" && (
          <PracticeScreen
            onJumpToLecture={handleJumpToLecture}
            onReturnHome={() => {
              setActiveTab("home");
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {activeTab === "me" && <MeScreen />}
      </NavigationShell>

      <AccessibilityDrawer
        isOpen={a11yOpen}
        onClose={() => setA11yOpen(false)}
        screenMainText={screenMainText}
      />
    </>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <StudentDataProvider>
        <BridgeAppContent />
      </StudentDataProvider>
    </AccessibilityProvider>
  );
}
