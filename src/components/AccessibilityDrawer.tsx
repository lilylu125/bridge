import { useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  Square,
  Volume2,
  Mic,
  Eye,
  Moon,
  Sparkles,
  Focus,
  Type,
  AlignJustify,
} from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  ReadableFontOption,
  SpacingOption,
  SpeechSpeed,
  TextSizeOption,
} from "../types";

interface AccessibilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  screenMainText: string;
}

export function AccessibilityDrawer({
  isOpen,
  onClose,
  screenMainText,
}: AccessibilityDrawerProps) {
  const {
    settings,
    updateSetting,
    togglePlayPause,
    stopSpeech,
    isSpeaking,
    isPaused,
    speechSupported,
  } = useAccessibility();

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const textSizes: { value: TextSizeOption; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Extra large" },
  ];

  const fonts: { value: ReadableFontOption; label: string }[] = [
    { value: "default", label: "Inter" },
    { value: "atkinson", label: "Atkinson Hyperlegible" },
    { value: "lexend", label: "Lexend" },
  ];

  const speeds: SpeechSpeed[] = [0.75, 1, 1.25];
  const spacings: { value: SpacingOption; label: string }[] = [
    { value: "normal", label: "Normal" },
    { value: "wide", label: "Wide" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Accessibility and reading tools"
        className="w-full max-w-md h-full overflow-y-auto bg-[var(--bridge-card)] text-[var(--bridge-text)] border-l border-[var(--bridge-border)] p-5 sm:p-6 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--bridge-border)]">
          <div>
            <h2 className="text-lg font-semibold font-heading">
              Reading and study tools
            </h2>
            <p className="text-sm text-[var(--bridge-text-secondary)]">
              Available anytime. Saved on this device.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close accessibility panel"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text)] hover:border-[var(--bridge-teal)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read aloud */}
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-[var(--bridge-teal)]" aria-hidden="true" />
              <span className="font-medium text-sm">Read aloud</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.readAloudEnabled}
              aria-label="Toggle read aloud preference"
              onClick={() =>
                updateSetting("readAloudEnabled", !settings.readAloudEnabled)
              }
              className={`min-h-[44px] px-4 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                settings.readAloudEnabled
                  ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
                  : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)]"
              }`}
            >
              {settings.readAloudEnabled ? "On" : "Off"}
            </button>
          </div>

          {speechSupported ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePlayPause(screenMainText)}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] hover:bg-[var(--bridge-teal-hover)] text-sm font-medium cursor-pointer"
                >
                  {isSpeaking && !isPaused ? (
                    <>
                      <Pause className="w-4 h-4" aria-hidden="true" />
                      <span>Pause screen</span>
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-4 h-4" aria-hidden="true" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" aria-hidden="true" />
                      <span>Read this screen</span>
                    </>
                  )}
                </button>
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopSpeech}
                    aria-label="Stop reading aloud"
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-sm font-medium cursor-pointer"
                  >
                    <Square className="w-4 h-4" aria-hidden="true" />
                    <span>Stop</span>
                  </button>
                )}
              </div>

              <div>
                <span className="block text-xs text-[var(--bridge-text-secondary)] mb-1.5">
                  Reading speed
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {speeds.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => updateSetting("speechSpeed", speed)}
                      aria-pressed={settings.speechSpeed === speed}
                      className={`min-h-[44px] rounded-xl text-sm font-medium border tabular-nums cursor-pointer ${
                        settings.speechSpeed === speed
                          ? "bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] border-[var(--bridge-teal)]"
                          : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)]"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--bridge-text-secondary)]">
              Read aloud uses your browser speech engine, which is unavailable in this browser.
            </p>
          )}
        </section>

        {/* Speak to answer */}
        <section className="rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] p-4 flex items-start gap-3">
          <Mic className="w-5 h-5 text-[var(--bridge-teal)] mt-0.5 shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium">Speak to answer</p>
            <p className="text-[var(--bridge-text-secondary)] mt-0.5">
              Tap the microphone button inside the Ask box or Practice answer field to dictate, or type anytime.
            </p>
          </div>
        </section>

        {/* Text size */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Type className="w-4 h-4 text-[var(--bridge-teal)]" aria-hidden="true" />
            <span>Text size</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {textSizes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => updateSetting("textSize", item.value)}
                aria-pressed={settings.textSize === item.value}
                className={`min-h-[44px] px-3 rounded-xl text-sm font-medium border cursor-pointer ${
                  settings.textSize === item.value
                    ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Readable font */}
        <section className="space-y-2">
          <span className="block text-sm font-medium">Readable font</span>
          <div className="grid grid-cols-1 gap-2">
            {fonts.map((font) => (
              <button
                key={font.value}
                type="button"
                onClick={() => updateSetting("readableFont", font.value)}
                aria-pressed={settings.readableFont === font.value}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-medium border text-left flex items-center justify-between cursor-pointer ${
                  settings.readableFont === font.value
                    ? "bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
                }`}
              >
                <span>{font.label}</span>
                {settings.readableFont === font.value && (
                  <span className="text-xs font-semibold">Active</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Line and letter spacing */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlignJustify className="w-4 h-4 text-[var(--bridge-teal)]" aria-hidden="true" />
            <span>Line and letter spacing</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {spacings.map((sp) => (
              <button
                key={sp.value}
                type="button"
                onClick={() => updateSetting("spacing", sp.value)}
                aria-pressed={settings.spacing === sp.value}
                className={`min-h-[44px] px-3 rounded-xl text-sm font-medium border cursor-pointer ${
                  settings.spacing === sp.value
                    ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)]"
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </section>

        {/* Visual toggles */}
        <section className="space-y-2.5 pt-1">
          <ToggleRow
            icon={<Eye className="w-4 h-4 text-[var(--bridge-teal)]" />}
            label="High contrast mode"
            description="Stronger borders and maximum text contrast"
            checked={settings.highContrast}
            onToggle={() =>
              updateSetting("highContrast", !settings.highContrast)
            }
          />
          <ToggleRow
            icon={<Moon className="w-4 h-4 text-[var(--bridge-teal)]" />}
            label="Dark mode"
            description="Calm dark surface for low-light study"
            checked={settings.darkMode}
            onToggle={() => updateSetting("darkMode", !settings.darkMode)}
          />
          <ToggleRow
            icon={<Sparkles className="w-4 h-4 text-[var(--bridge-teal)]" />}
            label="Reduce motion"
            description="Turns off all screen and card animations"
            checked={settings.reduceMotion}
            onToggle={() =>
              updateSetting("reduceMotion", !settings.reduceMotion)
            }
          />
          <ToggleRow
            icon={<Focus className="w-4 h-4 text-[var(--bridge-teal)]" />}
            label="Focus mode"
            description="Hides navigation and extra sections to show only the current chunk or question"
            checked={settings.focusMode}
            onToggle={() => updateSetting("focusMode", !settings.focusMode)}
          />
        </section>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full min-h-[56px] p-3.5 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] hover:border-[var(--bridge-teal)] flex items-center justify-between gap-3 text-left cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          {icon}
        </span>
        <div>
          <span className="block text-sm font-medium">{label}</span>
          <span className="block text-xs text-[var(--bridge-text-secondary)]">
            {description}
          </span>
        </div>
      </div>
      <span
        className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
          checked
            ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)]"
            : "bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text-secondary)]"
        }`}
      >
        {checked ? "On" : "Off"}
      </span>
    </button>
  );
}
