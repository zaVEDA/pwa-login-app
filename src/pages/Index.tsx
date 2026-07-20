import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import LoginScreen from "@/components/app/LoginScreen";
import HomeTab from "@/components/app/HomeTab";
import AdminDashboard from "@/components/admin/AdminDashboard";
import TabContent from "@/components/app/TabContent";
import BottomNav from "@/components/app/BottomNav";
import ProfileSetup from "@/components/app/ProfileSetup";
import ComingSoon from "@/components/app/ComingSoon";
import { authApi, getToken, clearAuth, AuthUser } from "@/lib/auth";

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const motivationalPhrases = [
  "Сегодня лучший день, чтобы сделать первый шаг.",
  "Каждый подписанный договор — это уважение к себе и клиенту.",
  "Профессионал отличается не талантом, а порядком в делах.",
  "Один правильно оформленный документ защищает лучше любых слов.",
  "Ваше время стоит дорого — цените его в договоре.",
  "Прозрачность в работе — основа доверия клиента.",
  "Сегодня хороший день, чтобы навести порядок в документах.",
  "Ваша экспертиза заслуживает официального оформления.",
  "Чёткие условия — меньше недопонимания, больше результата.",
  "Каждый новый клиент — новая возможность сделать всё правильно.",
];

const themes = {
  honey: { label: "Янтарь", phraseIcon: "Leaf" },
  sage:  { label: "Шалфей", phraseIcon: "Sprout" },
  rose:  { label: "Роза",   phraseIcon: "Flower2" },
  clay:  { label: "Глина",  phraseIcon: "TreePine" },
} as const;

export default function Index() {
  const todayPhrase = motivationalPhrases[new Date().getDate() % motivationalPhrases.length];
  const [colorTheme, setColorTheme] = useState<keyof typeof themes>(
    () => (localStorage.getItem("colorTheme") as keyof typeof themes) || "honey"
  );

  useEffect(() => {
    localStorage.setItem("colorTheme", colorTheme);
    const root = document.documentElement;
    if (colorTheme === "honey") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", colorTheme);
    }
  }, [colorTheme]);

  useEffect(() => {
    const saved = localStorage.getItem("colorTheme") as keyof typeof themes | null;
    if (saved && saved !== "honey") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const paymentResult = new URLSearchParams(window.location.search).get("payment");
  const [activeTab, setActiveTab] = useState<Tab>(paymentResult ? "account" : "home");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [demoMode, setDemoMode] = useState(isDemo);

  const phone = user?.phone || (demoMode ? "+70000000000" : "");

  const [inn, setInn] = useState("");
  const [fullName, setFullName] = useState(() => {
    try { return JSON.parse(localStorage.getItem("requisites") || "{}").fullName || ""; } catch { return ""; }
  });
  const [innSaved, setInnSaved] = useState(false);
  const [isSelfEmployed, setIsSelfEmployed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthChecked(true); return; }
    authApi.me().then(({ status, data }) => {
      if (status === 200 && data.user) {
        setUser(data.user);
        if (data.user.phone) localStorage.setItem("userPhone", data.user.phone);
      } else {
        clearAuth();
      }
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));

    if (paymentResult) {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleAuth = (u: AuthUser) => {
    setUser(u);
    setDemoMode(false);
    if (u.phone) localStorage.setItem("userPhone", u.phone);
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuth();
    setUser(null);
    setDemoMode(false);
    setActiveTab("home");
  };

  // Заглушка «Скоро запуск» — только на боевом домене zavdoc.ru.
  // Доступ открывается ссылкой ?enter=1 и запоминается. В превью/на других адресах вход открыт.
  const MAINTENANCE = true;
  const isProdDomain = window.location.hostname.endsWith("zavdoc.ru");
  const params = new URLSearchParams(window.location.search);
  if (params.get("enter") === "1") localStorage.setItem("earlyAccess", "1");
  const hasAccess = localStorage.getItem("earlyAccess") === "1";
  if (MAINTENANCE && isProdDomain && !hasAccess) {
    return <ComingSoon />;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(36 25% 96%)" }}>
        <Icon name="Loader" size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !demoMode) {
    return (
      <LoginScreen
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        onAuth={handleAuth}
        onDemo={() => setDemoMode(true)}
      />
    );
  }

  // Дозаполнение профиля после первого входа по телефону
  if (user && !user.profile_completed && !demoMode) {
    return <ProfileSetup user={user} onDone={(u) => setUser(u)} onSkip={() => setUser({ ...user, profile_completed: true })} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto"
      style={{ background: "linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}
    >
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {user?.role === "admin" ? "Кабинет Заведующей" : "Добро пожаловать"}
            </p>
            <h1 className="font-cormorant text-2xl font-semibold text-foreground">
              {user?.full_name || (demoMode ? "Гость" : "Пользователь")}
            </h1>
          </div>
          <button className="relative" onClick={() => setActiveTab("account")}>
            <div className="w-10 h-10 rounded-2xl gold-gradient flex items-center justify-center shadow-sm">
              <span className="font-cormorant text-lg font-bold text-white">
                {(user?.full_name || "Г").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "Г"}
              </span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </button>
        </div>

      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-28 space-y-6">
        {paymentResult === "success" && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
            <Icon name="CheckCircle2" size={15} className="flex-shrink-0" />
            Оплата прошла успешно, тариф активирован
          </div>
        )}
        {paymentResult === "fail" && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <Icon name="XCircle" size={15} className="flex-shrink-0" />
            Оплата не прошла, попробуйте снова
          </div>
        )}
        {activeTab === "home" && (
          user?.role === "admin" ? (
            <AdminDashboard />
          ) : (
            <HomeTab
              colorTheme={colorTheme}
              todayPhrase={todayPhrase}
              setActiveTab={setActiveTab}
              phone={phone}
              userPlan={user?.plan ?? null}
              userRole={user?.role}
            />
          )
        )}
        <TabContent
          activeTab={activeTab}
          isSelfEmployed={isSelfEmployed}
          inn={inn}
          setInn={setInn}
          fullName={fullName}
          setFullName={setFullName}
          innSaved={innSaved}
          setInnSaved={setInnSaved}
          onLogout={demoMode ? () => setDemoMode(false) : handleLogout}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          phone={phone}
          userName={user?.full_name}
          userRole={user?.role}
          userPlan={user?.plan ?? null}
          planExpiresAt={user?.plan_expires_at ?? null}
          familyRequestStatus={user?.family_request_status ?? null}
          onUserUpdated={setUser}
        />
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={user?.role} />
    </div>
  );
}