import { useEffect, useRef, useState } from "react";
import { PenTool, Eraser, Undo2, Trash2, FileText } from "lucide-react";
import { WorkMode } from "../types";
import { SpeechInputButton } from "./SpeechInputButton";

interface Point {
  x: number;
  y: number;
  width: number;
}

interface Stroke {
  points: Point[];
  isEraser: boolean;
}

interface ShowWorkPadProps {
  mode: WorkMode;
  onModeChange: (mode: WorkMode) => void;
  explanationText: string;
  onExplanationChange: (value: string) => void;
  sketchDataUrl: string | null;
  onSketchChange: (dataUrl: string | null) => void;
  quickSymbols: string[];
}

export function ShowWorkPad({
  mode,
  onModeChange,
  explanationText,
  onExplanationChange,
  sketchDataUrl,
  onSketchChange,
  quickSymbols,
}: ShowWorkPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);

  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeCount, setStrokeCount] = useState(0);
  const [lastPointerType, setLastPointerType] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  const redrawCanvas = (initialImageUrl?: string | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalW = canvas.width / dpr;
    const logicalH = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Subtle notebook dot grid for calm visual alignment
    ctx.fillStyle = "#E2E8E5";
    for (let x = 20; x < logicalW; x += 24) {
      for (let y = 20; y < logicalH; y += 24) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    const drawAllStrokes = () => {
      for (const stroke of strokesRef.current) {
        if (stroke.points.length === 0) continue;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = stroke.isEraser ? "#FFFFFF" : "#16201F";

        if (stroke.points.length === 1) {
          const p = stroke.points[0];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.isEraser ? "#FFFFFF" : "#16201F";
          ctx.fill();
          continue;
        }

        for (let i = 1; i < stroke.points.length; i++) {
          const prev = stroke.points[i - 1];
          const curr = stroke.points[i];
          ctx.beginPath();
          ctx.lineWidth = stroke.isEraser ? 18 : curr.width;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    if (initialImageUrl && strokesRef.current.length === 0) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, logicalW, logicalH);
        drawAllStrokes();
      };
      img.src = initialImageUrl;
      return;
    }

    drawAllStrokes();
  };

  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeAndInit = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(240 * dpr);
      redrawCanvas(sketchDataUrl);
    };

    resizeAndInit();
    window.addEventListener("resize", resizeAndInit);
    return () => window.removeEventListener("resize", resizeAndInit);
  }, [mode]);

  const getLocalPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Pressure-aware width for Apple Pencil / stylus
    const pressure =
      e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.5;
    const width = Math.max(1.8, Math.min(4.8, 1.8 + pressure * 3));
    return { x, y, width };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setLastPointerType(e.pointerType);

    isDrawingRef.current = true;
    const pt = getLocalPoint(e);
    const stroke: Stroke = {
      points: [pt],
      isEraser: tool === "eraser",
    };
    activeStrokeRef.current = stroke;
    strokesRef.current = [...strokesRef.current, stroke];
    setStrokeCount(strokesRef.current.length);
    redrawCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    e.preventDefault();
    const pt = getLocalPoint(e);
    activeStrokeRef.current.points.push(pt);
    redrawCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
    activeStrokeRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      onSketchChange(canvas.toDataURL("image/png"));
    }
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redrawCanvas();
    const canvas = canvasRef.current;
    if (canvas) {
      onSketchChange(
        strokesRef.current.length > 0 ? canvas.toDataURL("image/png") : null
      );
    }
  };

  const handleClearCanvas = () => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    onSketchChange(null);
    redrawCanvas();
  };

  const insertSymbol = (sym: string) => {
    const spacer =
      explanationText.length === 0 || explanationText.endsWith(" ") ? "" : " ";
    onExplanationChange(`${explanationText}${spacer}${sym} `);
  };

  return (
    <div className="rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface-subtle)] p-4 space-y-3">
      {/* Header + Segmented Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-sm font-semibold text-[var(--bridge-text)]">
            Show your work
          </span>
          <p className="text-xs text-[var(--bridge-text-secondary)]">
            Explain step by step in words or sketch with Apple Pencil / touch.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Show your work mode"
          className="inline-flex p-1 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "write"}
            onClick={() => onModeChange("write")}
            className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === "write"
                ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)]"
                : "text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Write &amp; explain</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "draw"}
            onClick={() => onModeChange("draw")}
            className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === "draw"
                ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)]"
                : "text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Draw / Apple Pencil</span>
          </button>
        </div>
      </div>

      {/* Write & Explain Mode */}
      {mode === "write" && (
        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <label htmlFor="word-problem-explanation" className="sr-only">
              Write out your steps and explanation
            </label>
            <textarea
              id="word-problem-explanation"
              rows={4}
              value={explanationText}
              onChange={(e) => onExplanationChange(e.target.value)}
              placeholder="Write your steps in your own words (for example: Step 1: divide grams by molar mass... Step 2: check the ratio...)"
              className="flex-1 w-full p-3.5 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-[var(--bridge-text)] text-sm placeholder:text-[var(--bridge-text-secondary)] leading-relaxed"
            />
            <SpeechInputButton
              ariaLabel="Speak your step-by-step explanation"
              onTranscript={(spoken) => {
                const spacer = explanationText.trim() ? " " : "";
                onExplanationChange(`${explanationText}${spacer}${spoken}`);
                setVoiceNote(null);
              }}
              onUnsupported={(msg) => setVoiceNote(msg)}
            />
          </div>

          {voiceNote && (
            <p className="text-xs text-[var(--bridge-text-secondary)]">
              {voiceNote}
            </p>
          )}

          {/* Quick symbol inserts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--bridge-text-secondary)] mr-1">
              Quick insert:
            </span>
            {quickSymbols.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertSymbol(sym)}
                className="min-h-[36px] min-w-[36px] px-2.5 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-card)] hover:border-[var(--bridge-teal)] text-xs font-medium text-[var(--bridge-text)] cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Draw / Apple Pencil Mode */}
      {mode === "draw" && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTool("pen")}
                aria-pressed={tool === "pen"}
                className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                  tool === "pen"
                    ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)]"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pen</span>
              </button>
              <button
                type="button"
                onClick={() => setTool("eraser")}
                aria-pressed={tool === "eraser"}
                className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                  tool === "eraser"
                    ? "bg-[var(--bridge-teal-solid)] text-[var(--bridge-on-teal)] border-[var(--bridge-teal)]"
                    : "bg-[var(--bridge-card)] text-[var(--bridge-text)] border-[var(--bridge-border)]"
                }`}
              >
                <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Eraser</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokeCount === 0}
                aria-label="Undo last stroke"
                className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-xs font-medium disabled:opacity-40 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={handleClearCanvas}
                disabled={strokeCount === 0 && !sketchDataUrl}
                aria-label="Clear sketch"
                className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-lg border border-[var(--bridge-border)] bg-[var(--bridge-card)] text-xs font-medium disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            aria-label="Scratchpad canvas for Apple Pencil, touch, or mouse work"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-[240px] rounded-xl border border-[var(--bridge-border)] bg-white touch-none cursor-crosshair block"
          />

          <div className="flex items-center justify-between text-xs text-[var(--bridge-text-secondary)]">
            <span>
              {lastPointerType === "pen"
                ? "Apple Pencil / stylus detected (pressure active)"
                : "Apple Pencil, finger touch, or mouse ready"}
            </span>
            {(strokeCount > 0 || sketchDataUrl) && (
              <span className="font-medium text-[var(--bridge-teal)]">
                Work saved on device
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
