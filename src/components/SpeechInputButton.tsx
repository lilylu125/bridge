import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechInputButtonProps {
  onTranscript: (text: string) => void;
  ariaLabel?: string;
  onUnsupported?: (message: string) => void;
}

export function SpeechInputButton({
  onTranscript,
  ariaLabel = "Speak to answer",
  onUnsupported,
}: SpeechInputButtonProps) {
  const [listening, setListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const getCtor = (): SpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleToggle = () => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const Ctor = getCtor();
    if (!Ctor) {
      const msg =
        "Voice input is not supported in this browser. You can type your answer instead.";
      setStatusMessage(msg);
      onUnsupported?.(msg);
      return;
    }

    try {
      const recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          onTranscript(transcript);
          setStatusMessage(null);
        }
      };

      recognition.onerror = () => {
        setListening(false);
        const msg = "Could not hear voice input. You can type your answer.";
        setStatusMessage(msg);
        onUnsupported?.(msg);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      setStatusMessage(null);
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      const msg =
        "Voice input is unavailable right now. Please type your answer.";
      setStatusMessage(msg);
      onUnsupported?.(msg);
    }
  };

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={listening ? "Stop voice input" : ariaLabel}
        aria-pressed={listening}
        title={listening ? "Listening — tap to stop" : ariaLabel}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 rounded-xl border transition-colors cursor-pointer shrink-0 ${
          listening
            ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
            : "bg-[var(--bridge-surface-subtle)] text-[var(--bridge-text)] border-[var(--bridge-border)] hover:border-[var(--bridge-teal)] hover:text-[var(--bridge-teal)]"
        }`}
      >
        {listening ? (
          <>
            <MicOff className="w-4 h-4" />
            <span className="text-xs font-medium whitespace-nowrap">Listening</span>
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      {statusMessage && !onUnsupported && (
        <span className="sr-only" role="status">
          {statusMessage}
        </span>
      )}
    </div>
  );
}
