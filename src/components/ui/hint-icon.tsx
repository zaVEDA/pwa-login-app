import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  text: string;
  className?: string;
}

/**
 * Единый по всему приложению значок "?" с подсказкой по клику.
 * Крупный, с мягким пульсирующим свечением, пока подсказка не открыта.
 */
export default function HintIcon({ text, className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="Справка"
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          open ? "bg-primary text-white" : "bg-primary/15 text-primary hover:bg-primary/25 animate-hint-glow"
        }`}
      >
        <Icon name="HelpCircle" size={16} />
      </button>

      {open && (
        <div className="mt-2.5 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2 max-w-xs">
          <Icon name="Info" size={13} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/80 leading-relaxed">{text}</p>
        </div>
      )}
    </div>
  );
}
