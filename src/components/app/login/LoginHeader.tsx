const specialtyColors = [
  { emoji: "🧠", label: "Психолог", bg: "linear-gradient(135deg, #FDCEDF, #F17EAA)" },
  { emoji: "🎯", label: "Коуч", bg: "linear-gradient(135deg, #FFE5B4, #FF9F45)" },
  { emoji: "🔮", label: "Астролог", bg: "linear-gradient(135deg, #D6C7FF, #9B7BFF)" },
  { emoji: "✨", label: "Нумеролог", bg: "linear-gradient(135deg, #C9F2E0, #4FBF8B)" },
  { emoji: "📚", label: "Репетитор", bg: "linear-gradient(135deg, #C7E4FF, #5B9BF5)" },
  { emoji: "👶", label: "Няня", bg: "linear-gradient(135deg, #FFE9C7, #F5B95B)" },
  { emoji: "📷", label: "Фотограф", bg: "linear-gradient(135deg, #D6E8FF, #7BAEFF)" },
  { emoji: "🏠", label: "Арендодатель", bg: "linear-gradient(135deg, #FFD9C7, #F58B5B)" },
  { emoji: "✨", label: "Мастер", bg: "linear-gradient(135deg, #F5D9FF, #C77BFF)" },
  { emoji: "💬", label: "Консультант", bg: "linear-gradient(135deg, #C7FFF0, #5BE0C7)" },
  { emoji: "💻", label: "Программист", bg: "linear-gradient(135deg, #D0D9FF, #6B7FE8)" },
  { emoji: "🎭", label: "Актёр", bg: "linear-gradient(135deg, #FFD6E0, #F55B8B)" },
  { emoji: "🧹", label: "Фея чистоты", bg: "linear-gradient(135deg, #E0F5FF, #6BC7F5)" },
];

interface Props {
  showSpecialties: boolean;
  selectedSpecialty: string | null;
  setSelectedSpecialty: (v: string | null) => void;
}

export default function LoginHeader({ showSpecialties, selectedSpecialty, setSelectedSpecialty }: Props) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-end gap-2 mb-8 max-w-full" style={{ alignItems: "flex-end" }}>
        <img src="/logo-capydoc.png" alt="CapyDoc.ru" width="72" height="72" className="flex-shrink-0 rounded-2xl w-14 h-14 sm:w-[72px] sm:h-[72px]" style={{ marginTop: "12px" }} />
        <div className="min-w-0">
          <h1 className="font-cormorant font-semibold text-foreground leading-tight text-3xl sm:text-[2.7rem] whitespace-nowrap">
            <span style={{ color: "hsl(35 72% 42%)" }}>Capy</span>Doc<span className="text-lg sm:text-2xl">.ru</span>
          </h1>
          <p className="font-cormorant italic font-semibold text-foreground/90 leading-tight text-center text-lg sm:text-[1.7rem] whitespace-nowrap" style={{ letterSpacing: "0.08em" }}>
            Вашими документами
          </p>
        </div>
      </div>

      {/* Specialties */}
      {showSpecialties && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-8 max-w-[380px] mx-auto">
          {specialtyColors.map((s) => (
            <button
              key={s.label}
              onClick={() => setSelectedSpecialty(s.label === selectedSpecialty ? null : s.label)}
              className={`flex items-center gap-1 pl-1 pr-2.5 py-1 rounded-full text-xs font-normal transition-all duration-200 border ${
                selectedSpecialty === s.label
                  ? "shadow-sm border-transparent"
                  : "bg-white/80 border-border text-foreground hover:border-primary/40"
              }`}
              style={
                selectedSpecialty === s.label
                  ? { background: "hsl(35 72% 48% / 0.12)", color: "hsl(35 72% 38%)" }
                  : undefined
              }
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs flex-shrink-0">
                {s.emoji}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}