import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { captchaApi, CaptchaChallenge } from "@/lib/captcha";

interface Props {
  onVerified: (passToken: string) => void;
  disabled?: boolean;
  disabledHint?: string;
}

export default function PuzzleCaptcha({ onVerified, disabled, disabledHint }: Props) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sliderX, setSliderX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "fail">("idle");
  const [lockedNotice, setLockedNotice] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const lockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLockedNotice = useCallback(() => {
    setLockedNotice(true);
    if (lockedTimerRef.current) clearTimeout(lockedTimerRef.current);
    lockedTimerRef.current = setTimeout(() => setLockedNotice(false), 3800);
  }, []);

  useEffect(() => () => { if (lockedTimerRef.current) clearTimeout(lockedTimerRef.current); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setStatus("idle");
    setSliderX(0);
    const r = await captchaApi.generate();
    setLoading(false);
    if (r.status !== 200) {
      setError("Не удалось загрузить проверку");
      return;
    }
    setChallenge(r.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxX = challenge ? challenge.canvas_width - challenge.piece_width : 0;

  const handleMove = useCallback(
    (clientX: number) => {
      if (!trackRef.current || !challenge) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const x = Math.round(Math.max(0, Math.min(1, ratio)) * maxX);
      setSliderX(x);
    },
    [challenge, maxX]
  );

  const handleUp = useCallback(async () => {
    if (!dragging || !challenge) return;
    setDragging(false);
    setStatus("checking");
    const r = await captchaApi.verify(challenge.token, sliderX);
    if (r.status === 200 && r.data.ok && r.data.pass_token) {
      setStatus("success");
      onVerified(r.data.pass_token);
    } else {
      setStatus("fail");
      setTimeout(() => load(), 700);
    }
  }, [dragging, challenge, sliderX, onVerified, load]);

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, handleMove, handleUp]);

  if (loading && !challenge) {
    return (
      <div className="w-full py-8 flex items-center justify-center rounded-xl border border-border bg-white/50">
        <Icon name="Loader" size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="w-full py-4 flex flex-col items-center gap-2 rounded-xl border border-border bg-white/50">
        <p className="text-xs text-muted-foreground">{error || "Ошибка проверки"}</p>
        <button onClick={load} className="text-xs text-primary underline">Обновить</button>
      </div>
    );
  }

  const sliderRatio = maxX ? sliderX / maxX : 0;

  if (status === "success") {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl border border-primary/30 animate-fade-in"
        style={{ background: "linear-gradient(135deg, hsl(35 72% 48% / 0.10), hsl(35 60% 55% / 0.05))" }}
      >
        <img
          src="/logo-capydoc.png"
          alt="CapyDoc.ru"
          width="88"
          height="88"
          className="w-22 h-22 rounded-2xl shadow-sm object-contain flex-shrink-0"
          style={{ width: "88px", height: "88px" }}
        />
        <p className="font-cormorant text-xl font-semibold text-center leading-snug">
          Добро пожаловать в<br />
          <span style={{ color: "hsl(35 72% 42%)" }}>Capy</span>
          <span className="text-foreground">Doc.ru</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 flex flex-col items-center">
      <div
        className="relative rounded-xl overflow-hidden border border-border select-none"
        style={{
          width: "100%",
          maxWidth: `${challenge.canvas_width}px`,
          aspectRatio: `${challenge.canvas_width} / ${challenge.canvas_height}`,
        }}
      >
        <img
          src={challenge.background}
          alt="Капча"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <img
          src={challenge.piece}
          alt=""
          draggable={false}
          className="absolute pointer-events-none"
          style={{
            left: `${(sliderX / challenge.canvas_width) * 100}%`,
            top: `${(challenge.piece_y / challenge.canvas_height) * 100}%`,
            width: `${(challenge.piece_width / challenge.canvas_width) * 100}%`,
            transition: dragging ? "none" : "left 0.25s ease",
          }}
        />
        {status === "fail" && (
          <div className="absolute inset-0 bg-red-600/15 flex items-center justify-center">
            <Icon name="X" size={28} className="text-red-600" />
          </div>
        )}
        <button
          type="button"
          onClick={load}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center"
        >
          <Icon name="RefreshCw" size={12} className="text-muted-foreground" />
        </button>
      </div>

      {disabled ? (
        <div className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-center gap-2" style={{ maxWidth: `${challenge.canvas_width}px` }}>
          <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-amber-800 leading-snug">
            {disabledHint || "Сначала примите условия выше"}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-center font-medium text-primary">
          Потяните бегунок вправо, чтобы собрать пазл →
        </p>
      )}

      {lockedNotice && (
        <div className="w-full px-3.5 py-3 rounded-xl bg-amber-50 border-2 border-amber-300 flex items-start gap-2 animate-fade-in" style={{ maxWidth: `${challenge.canvas_width}px` }}>
          <Icon name="ArrowUp" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] font-medium text-amber-800 leading-relaxed">
            Пожалуйста, сначала заполните данные выше, ознакомьтесь с офертой и согласием — поставьте галочки
          </p>
        </div>
      )}

      <div
        ref={trackRef}
        onMouseDown={() => { if (disabled) showLockedNotice(); }}
        onTouchStart={() => { if (disabled) showLockedNotice(); }}
        className={`relative h-10 w-full rounded-xl bg-muted/60 border border-border overflow-hidden ${disabled ? "opacity-50" : ""}`}
        style={{ maxWidth: `${challenge.canvas_width}px` }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-xl gold-gradient opacity-30"
          style={{ width: `${sliderRatio * 100}%` }}
        />

        {/* Подсказка направления: бегущие вправо стрелки-шевроны, видны только пока не начали тянуть */}
        {!disabled && !dragging && sliderRatio < 0.05 && (
          <div className="absolute inset-y-0 left-12 right-2 flex items-center gap-1 pointer-events-none">
            {[0, 1, 2].map((i) => (
              <Icon
                key={i}
                name="ChevronRight"
                size={14}
                className="text-primary/70 animate-chevron-right"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </div>
        )}

        <div
          onMouseDown={(e) => { if (disabled) { showLockedNotice(); return; } e.preventDefault(); setDragging(true); }}
          onTouchStart={() => { if (disabled) { showLockedNotice(); return; } setDragging(true); }}
          className={`absolute top-0 h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-md ${
            disabled ? "cursor-not-allowed animate-pulse-glow" : "cursor-grab active:cursor-grabbing"
          } ${!disabled && !dragging ? "animate-pulse-glow" : ""}`}
          style={{
            left: `calc(${sliderRatio * 100}% - ${sliderRatio * 40}px)`,
            transition: dragging ? "none" : "left 0.25s ease",
          }}
        >
          <Icon name={disabled ? "Lock" : "GripHorizontal"} size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
}