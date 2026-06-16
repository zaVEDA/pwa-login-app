import Icon from "@/components/ui/icon";

const specialties = [
  { icon: "Brain", label: "Психолог" },
  { icon: "Star", label: "Астролог" },
  { icon: "Hash", label: "Нумеролог" },
  { icon: "Target", label: "Коуч" },
  { icon: "BookOpen", label: "Репетитор" },
  { icon: "Baby", label: "Няня" },
  { icon: "Camera", label: "Фотограф" },
];

interface Props {
  selectedSpecialty: string | null;
  setSelectedSpecialty: (v: string | null) => void;
  loginStep: "phone" | "code" | "status";
  setLoginStep: (v: "phone" | "code" | "status") => void;
  phone: string;
  setPhone: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  userStatus: "self_employed" | "ip" | "ooo" | "individual" | null;
  setUserStatus: (v: "self_employed" | "ip" | "ooo" | "individual" | null) => void;
  setIsSelfEmployed: (v: boolean | null) => void;
  setIsLoggedIn: (v: boolean) => void;
}

export default function LoginScreen({
  selectedSpecialty,
  setSelectedSpecialty,
  loginStep,
  setLoginStep,
  phone,
  setPhone,
  code,
  setCode,
  userStatus,
  setUserStatus,
  setIsSelfEmployed,
  setIsLoggedIn,
}: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-8 px-5 overflow-y-auto"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 50%, hsl(30 25% 87%) 100%)" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-end gap-2 mb-10" style={{alignItems: 'flex-end'}}>
          <svg width="59" height="96" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            {/* Телефон */}
            <rect x="10" y="2" width="40" height="76" rx="10" stroke="#C8862A" strokeWidth="3.5" fill="none"/>
            {/* Нотч */}
            <rect x="19" y="2" width="18" height="7" rx="3.5" stroke="#C8862A" strokeWidth="2" fill="none"/>
            {/* Кнопка громкость+ слева */}
            <rect x="6" y="24" width="4" height="9" rx="2" fill="#C8862A"/>
            {/* Кнопка громкость- слева */}
            <rect x="6" y="36" width="4" height="9" rx="2" fill="#C8862A"/>
            {/* Свиток — верхний валик */}
            <rect x="14" y="16" width="32" height="10" rx="5" stroke="#C8862A" strokeWidth="2.5" fill="none"/>
            {/* Свиток — тело */}
            <rect x="16" y="26" width="28" height="26" stroke="#C8862A" strokeWidth="2" fill="none"/>
            {/* Свиток — нижний валик */}
            <rect x="14" y="52" width="32" height="10" rx="5" stroke="#C8862A" strokeWidth="2.5" fill="none"/>
            {/* Галочка */}
            <path d="M23 40 L29 47 L43 30" stroke="#C8862A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <h1 className="font-cormorant font-semibold text-foreground leading-tight" style={{fontSize: '3.4rem'}}>
              <span style={{ color: "hsl(35 72% 42%)" }}>За</span>Ведующая
            </h1>
            <p className="font-cormorant italic font-semibold text-foreground/90 leading-tight text-center whitespace-nowrap" style={{fontSize: '1.7rem', letterSpacing: '0.12em'}}>
              Вашими документами
            </p>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {specialties.map((s) => (
            <button
              key={s.label}
              onClick={() => setSelectedSpecialty(s.label === selectedSpecialty ? null : s.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                selectedSpecialty === s.label
                  ? "gold-gradient text-white border-transparent shadow-sm"
                  : "bg-white/60 border-border text-foreground hover:border-primary/40"
              }`}
            >
              <Icon name={s.icon} size={12} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Login form */}
        <div className="card-warm rounded-2xl p-6 shadow-lg shadow-amber-900/10">
          <h2 className="font-cormorant text-2xl font-semibold mb-1">
            {loginStep === "phone" ? "Войти в аккаунт" : loginStep === "code" ? "Введите код" : "Ваш статус"}
          </h2>
          <p className="text-muted-foreground text-sm mb-5">
            {loginStep === "phone" ? "Введите номер телефона — вход через ПЭП" : loginStep === "code" ? `Код отправлен на +7 ${phone}` : "Выберите, как вы работаете"}
          </p>

          {loginStep === "status" ? (
            <div className="space-y-2.5">
              {([
                { id: "self_employed", icon: "Leaf", title: "Самозанятый", desc: "Зарегистрирован в «Мой налог», плачу НПД 4–6%" },
                { id: "ip", icon: "Briefcase", title: "ИП", desc: "Индивидуальный предприниматель, УСН или патент" },
                { id: "ooo", icon: "Building2", title: "Сотрудник / руководитель ООО", desc: "Работаю в компании или возглавляю её" },
                { id: "individual", icon: "User", title: "Физическое лицо", desc: "Работаю без регистрации, хочу разобраться" },
                { id: null, icon: "HelpCircle", title: "Ещё не определился", desc: "Помогу разобраться, какой статус подходит" },
              ] as const).map((s) => {
                const active = userStatus === s.id;
                return (
                  <button
                    key={String(s.id)}
                    onClick={() => { setUserStatus(s.id as "self_employed" | "ip" | "ooo" | "individual" | null); setIsSelfEmployed(s.id === "self_employed"); setIsLoggedIn(true); }}
                    className={`w-full p-3.5 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${active ? "border-primary gold-gradient" : "border-border bg-white/60 hover:border-primary/30"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? "bg-white/20" : "bg-amber-700/10"}`}>
                        <Icon name={s.icon} size={16} className={active ? "text-white" : "text-amber-700"} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${active ? "text-white" : "text-foreground"}`}>{s.title}</p>
                        <p className={`text-xs mt-0.5 leading-tight ${active ? "text-white/70" : "text-muted-foreground"}`}>{s.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : loginStep === "phone" ? (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+7</span>
                <input
                  type="tel"
                  placeholder="900 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                />
              </div>
              <button
                onClick={() => phone.length >= 10 && setLoginStep("code")}
                className="w-full py-3 rounded-xl gold-gradient text-white font-medium text-sm shadow-sm shadow-amber-900/20 active:scale-[0.98] transition-transform"
              >
                Получить код
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-semibold transition-colors ${
                      code.length === i
                        ? "border-primary bg-white"
                        : code.length > i
                        ? "border-primary/60 bg-white/80"
                        : "border-border bg-white/50"
                    }`}
                  >
                    {code[i] || ""}
                  </div>
                ))}
              </div>
              <input
                type="number"
                value={code}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 4);
                  setCode(val);
                  if (val.length === 4) setTimeout(() => setIsLoggedIn(true), 300);
                }}
                className="opacity-0 absolute pointer-events-none"
                autoFocus
              />
              <button
                onClick={() => setLoginStep("status")}
                className="w-full py-3 rounded-xl gold-gradient text-white font-medium text-sm"
              >
                Войти
              </button>
              <button onClick={() => setLoginStep("phone")} className="w-full py-2 text-xs text-muted-foreground">
                Изменить номер
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsLoggedIn(true)}
          className="w-full mt-4 py-2.5 rounded-xl border border-border bg-white/40 text-xs text-muted-foreground hover:bg-white/70 transition-colors"
        >
          Посмотреть без регистрации →
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
          Регистрируясь, вы соглашаетесь с{" "}
          <span className="text-primary cursor-pointer">условиями использования</span>{" "}
          и <span className="text-primary cursor-pointer">политикой конфиденциальности</span>
        </p>
      </div>
    </div>
  );
}