import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AccessibilitySettings } from "../types";

const STORAGE_KEY = "bridge_a11y_v1";

export const DEFAULT_A11Y_SETTINGS: AccessibilitySettings = {
  readAloudEnabled: true,
  speechSpeed: 1,
  textSize: "md",
  readableFont: "default",
  spacing: "normal",
  highContrast: false,
  darkMode: false,
  reduceMotion: false,
  focusMode: false,
};

const TEXT_SCALE_MAP: Record<AccessibilitySettings["textSize"], string> = {
  sm: "0.9",
  md: "1",
  lg: "1.14",
  xl: "1.28",
};

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  speak: (text: string, sourceId?: string) => void;
  togglePlayPause: (screenText: string) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  activeSpeechId: string | null;
  speechSupported: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

function loadStoredSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_A11Y_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_A11Y_SETTINGS;
  }
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    loadStoredSettings
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const currentTextRef = useRef<string>("");

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.darkMode);
    root.classList.toggle("high-contrast", settings.highContrast);
    root.classList.toggle("reduce-motion", settings.reduceMotion);
    root.classList.toggle(
      "font-readable-atkinson",
      settings.readableFont === "atkinson"
    );
    root.classList.toggle(
      "font-readable-lexend",
      settings.readableFont === "lexend"
    );
    root.classList.toggle("spacing-wide", settings.spacing === "wide");
    root.style.setProperty(
      "--bridge-text-scale",
      TEXT_SCALE_MAP[settings.textSize]
    );
  }, [settings]);

  const stopSpeech = useCallback(() => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveSpeechId(null);
  }, [speechSupported]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, sourceId = "global") => {
      if (!speechSupported || !text.trim()) return;

      // Toggle off if clicking the same active speaker card
      if (isSpeaking && activeSpeechId === sourceId && !isPaused) {
        stopSpeech();
        return;
      }

      window.speechSynthesis.cancel();
      currentTextRef.current = text;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speechSpeed;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setActiveSpeechId(sourceId);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveSpeechId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveSpeechId(null);
      };

      setIsSpeaking(true);
      setIsPaused(false);
      setActiveSpeechId(sourceId);
      window.speechSynthesis.speak(utterance);
    },
    [
      activeSpeechId,
      isPaused,
      isSpeaking,
      settings.speechSpeed,
      speechSupported,
      stopSpeech,
    ]
  );

  const togglePlayPause = useCallback(
    (screenText: string) => {
      if (!speechSupported) return;

      if (!isSpeaking) {
        speak(screenText, "screen");
        return;
      }

      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    },
    [isPaused, isSpeaking, speak, speechSupported]
  );

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      if (key === "readAloudEnabled" && value === false) {
        stopSpeech();
      }
    },
    [stopSpeech]
  );

  const resetSettings = useCallback(() => {
    stopSpeech();
    setSettings(DEFAULT_A11Y_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, [stopSpeech]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        speak,
        togglePlayPause,
        stopSpeech,
        isSpeaking,
        isPaused,
        activeSpeechId,
        speechSupported,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used inside AccessibilityProvider"
    );
  }
  return ctx;
}
