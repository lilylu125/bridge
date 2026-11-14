import { Clock } from "lucide-react";

interface TimestampChipProps {
  label: string;
  onSelect?: (timestamp: string) => void;
}

export function TimestampChip({ label, onSelect }: TimestampChipProps) {
  const match = label.match(/(\d{1,2}:\d{2})/);
  const timeOnly = match ? match[1] : label;

  if (!onSelect) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] text-xs font-medium tabular-nums">
        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(timeOnly)}
      aria-label={`Jump to ${label}`}
      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-[var(--bridge-teal-soft)] text-[var(--bridge-teal)] hover:opacity-90 border border-[var(--bridge-teal)]/20 text-xs font-medium tabular-nums transition-opacity cursor-pointer"
    >
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
