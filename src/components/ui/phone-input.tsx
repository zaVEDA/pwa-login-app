import { useRef } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (digits: string) => void;
  className?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
}

function formatPhone(digits: string): string {
  const d = digits.slice(0, 10);
  let out = "+7";
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

function extractDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 0) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export default function PhoneInput({ value, onChange, className, readOnly, autoFocus, id }: PhoneInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  const clampCaret = () => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const pos = el.selectionStart ?? 0;
      if (pos < 2) el.setSelectionRange(2, 2);
    });
  };

  return (
    <input
      ref={ref}
      id={id}
      type="tel"
      inputMode="numeric"
      autoFocus={autoFocus}
      readOnly={readOnly}
      value={formatPhone(value)}
      onChange={(e) => onChange(extractDigits(e.target.value))}
      onFocus={clampCaret}
      onClick={clampCaret}
      onKeyDown={(e) => {
        const el = ref.current;
        if (!el) return;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        if ((e.key === "Backspace" && start <= 2 && start === end) || (e.key === "Delete" && start < 2)) {
          e.preventDefault();
        }
      }}
      placeholder="+7 (900) 000-00-00"
      className={className}
    />
  );
}
