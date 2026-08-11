import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { captchaApi, CaptchaChallenge } from "@/lib/captcha";

interface Props {
  onVerified: (passToken: string) => void;
}

export default function PuzzleCaptcha({ onVerified }: Props) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sliderX, setSliderX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "fail">("idle");
  const trackRef = useRef<HTMLDivElement>(null);

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
        {status === "success" && (
          <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
            <Icon name="CircleCheck" size={28} className="text-green-600" />
          </div>
        )}
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

      <p className="text-[11px] text-center text-muted-foreground">
        {status === "success" ? "Проверка пройдена" : "Передвиньте пазл на место"}
      </p>

      <div
        ref={trackRef}
        className="relative h-10 w-full rounded-xl bg-muted/60 border border-border"
        style={{ maxWidth: `${challenge.canvas_width}px` }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-xl gold-gradient opacity-30"
          style={{ width: `${sliderRatio * 100}%` }}
        />
        <div
          onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
          onTouchStart={() => setDragging(true)}
          className="absolute top-0 h-10 w-10 rounded-xl gold-gradient flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
          style={{
            left: `calc(${sliderRatio * 100}% - ${sliderRatio * 40}px)`,
            transition: dragging ? "none" : "left 0.25s ease",
          }}
        >
          <Icon name="ArrowRightLeft" size={16} className="text-white" />
        </div>
      </div>
    </div>
  );
}