interface ImagePlaceholderProps {
  label?: string;
  className?: string;
  aspect?: string;
}

export default function ImagePlaceholder({
  label = "Место для фото",
  className = "",
  aspect = "aspect-[4/3]",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`${aspect} w-full rounded-3xl border-2 border-dashed flex items-center justify-center ${className}`}
      style={{ borderColor: "hsl(140 30% 55% / 0.35)", background: "hsl(140 30% 55% / 0.06)" }}
    >
      <span className="text-sm font-medium" style={{ color: "hsl(140 25% 35%)" }}>
        {label}
      </span>
    </div>
  );
}
