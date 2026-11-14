import { Volume2, Square } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

interface SpeakButtonProps {
  text: string;
  sourceId: string;
  label?: string;
}

export function SpeakButton({
  text,
  sourceId,
  label = "Read this card aloud",
}: SpeakButtonProps) {
  const { speak, isSpeaking, isPaused, activeSpeechId, speechSupported } =
    useAccessibility();

  const isThisPlaying = isSpeaking && activeSpeechId === sourceId && !isPaused;

  if (!speechSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => speak(text, sourceId)}
      aria-label={isThisPlaying ? "Stop reading aloud" : label}
      aria-pressed={isThisPlaying}
      title={isThisPlaying ? "Stop reading aloud" : label}
      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-teal)] hover:border-[var(--bridge-teal)] transition-colors shrink-0 cursor-pointer"
    >
      {isThisPlaying ? (
        <Square className="w-4 h-4 fill-current text-[var(--bridge-teal)]" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}
