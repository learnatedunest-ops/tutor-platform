/**
 * TimeRangePicker — select a start and end time from dropdown lists
 * Renders two time selects (Start Time → End Time) and emits a formatted string
 * e.g. "10:00 AM - 12:00 PM"
 */
import { useState, useEffect } from "react";

interface TimeRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

// Generate time slots in 30-minute increments from 5:00 AM to 10:00 PM
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const period = h < 12 ? "AM" : "PM";
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const displayM = m === 0 ? "00" : "30";
      slots.push(`${displayH}:${displayM} ${period}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

// Parse "10:00 AM - 12:00 PM" → { start: "10:00 AM", end: "12:00 PM" }
function parseRange(value: string): { start: string; end: string } {
  if (!value) return { start: "", end: "" };
  const parts = value.split(" - ");
  return { start: parts[0]?.trim() ?? "", end: parts[1]?.trim() ?? "" };
}

export default function TimeRangePicker({
  value,
  onChange,
  label,
  placeholder = "e.g. 10:00 AM - 12:00 PM",
}: TimeRangePickerProps) {
  const parsed = parseRange(value);
  const [start, setStart] = useState(parsed.start);
  const [end, setEnd] = useState(parsed.end);

  // Sync from external value changes (e.g. loading existing profile)
  useEffect(() => {
    const p = parseRange(value);
    setStart(p.start);
    setEnd(p.end);
  }, [value]);

  const handleStart = (s: string) => {
    setStart(s);
    if (end) onChange(`${s} - ${end}`);
    else onChange(s);
  };

  const handleEnd = (e: string) => {
    setEnd(e);
    if (start) onChange(`${start} - ${e}`);
    else onChange(e);
  };

  const selectClass =
    "flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <select
          value={start}
          onChange={e => handleStart(e.target.value)}
          className={selectClass}
          aria-label="Start time"
        >
          <option value="">Start time</option>
          {TIME_SLOTS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span className="text-muted-foreground text-sm font-medium shrink-0">to</span>

        <select
          value={end}
          onChange={e => handleEnd(e.target.value)}
          className={selectClass}
          aria-label="End time"
        >
          <option value="">End time</option>
          {TIME_SLOTS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{value}</span>
        </p>
      )}
      {!value && placeholder && (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
}
