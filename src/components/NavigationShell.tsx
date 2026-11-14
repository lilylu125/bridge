import { Home, BookOpen, CheckCircle2, User, Focus } from "lucide-react";
import { TabId } from "../types";
import { useAccessibility } from "../context/AccessibilityContext";
import { useStudentData } from "../context/StudentDataContext";
import { getCourseById } from "../data/chemistryData";

interface NavigationShellProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenA11y: () => void;
  children: React.ReactNode;
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "practice", label: "Practice", icon: CheckCircle2 },
  { id: "me", label: "Me", icon: User },
];

export function NavigationShell({
  activeTab,
  onSelectTab,
  onOpenA11y,
  children,
}: NavigationShellProps) {
  const { settings, updateSetting } = useAccessibility();
  const { data } = useStudentData();
  const course = getCourseById(data.activeCourseId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bridge-bg)] text-[var(--bridge-text)]">
      <header className="w-full border-b border-[var(--bridge-border)] bg-[var(--bridge-card)]">
        <div className="max-w-4xl mx-auto pl-4 pr-16 sm:pl-6 sm:pr-20 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg font-bold tracking-tight font-heading whitespace-nowrap shrink-0 text-[var(--bridge-teal)]">
              Bridge
            </span>
            {!settings.focusMode && (
              <span className="text-xs text-[var(--bridge-text-secondary)] truncate">
                {course.code} · {course.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {settings.focusMode && (
              <button
                type="button"
                onClick={() => updateSetting("focusMode", false)}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--bridge-teal)] bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                <Focus className="w-4 h-4" aria-hidden="true" />
                <span>Exit focus mode</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <button
        type="button"
        onClick={onOpenA11y}
        aria-label="Open accessibility and reading tools (Aa)"
        className="fixed top-1.5 right-3 sm:right-5 z-40 inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-[var(--bridge-text)] hover:border-[var(--bridge-teal)] hover:text-[var(--bridge-teal)] font-heading font-semibold text-sm shadow-sm cursor-pointer"
      >
        Aa
      </button>

      <main
        className={`flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 ${
          settings.focusMode ? "pb-10" : "pb-24"
        }`}
      >
        {children}
      </main>

      {!settings.focusMode && (
        <nav
          aria-label="Main navigation"
          className="fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-[var(--bridge-border)] bg-[var(--bridge-card)]"
        >
          <div className="max-w-4xl mx-auto h-full grid grid-cols-4 items-center px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center justify-center min-h-[44px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? "text-[var(--bridge-teal)] font-semibold"
                      : "text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
                  }`}
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={isActive ? 2.25 : 1.75}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] leading-tight mt-1 whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
