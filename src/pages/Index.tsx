import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import TemplateBriefModal from "@/components/promo/TemplateBriefModal";
import LoginScreen from "@/components/app/LoginScreen";
import HomeTab from "@/components/app/HomeTab";
import AdminDashboard from "@/components/admin/AdminDashboard";
import TabContent from "@/components/app/TabContent";
import BottomNav from "@/components/app/BottomNav";
import ProfileSetup from "@/components/app/ProfileSetup";
import ComingSoon from "@/components/app/ComingSoon";
import LimitDialog from "@/components/app/LimitDialog";
import TrialCodeModal from "@/components/app/TrialCodeModal";
import { authApi, getToken, clearAuth, AuthUser } from "@/lib/auth";
import { fetchDocLimits, DocLimits } from "@/lib/limits";
import { reachGoal } from "@/lib/metrika";
import { toast } from "sonner";

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
  const [showBrief, setShowBrief] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [adminSection, setAdminSection] = useState("menu");
  // Гостевой демо-режим — доступен только по личной ссылке /guest (не публикуется в UI)
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [demoMode, setDemoMode] = useState(isDemo);

  // Ранний доступ: мои личные ссылки ?enter=1 (админ) и ?demo=1 (Гость)
  const [hasEarlyAccess] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("enter") === "1" || p.get("demo") === "1") {
      localStorage.setItem("earlyAccess", "1");
    }
    return localStorage.getItem("earlyAccess") === "1";
  });
  const [maintenance, setMaintenance] = useState<boolean | null>(hasEarlyAccess ? false : null);

  useEffect(() => {
    if (hasEarlyAccess) return;
    authApi.getMaintenance()
      .then(({ data }) => setMaintenance(Boolean(data.maintenance)))
      .catch(() => setMaintenance(false));
  }, [hasEarlyAccess]);

  const phone = user?.phone || (demoMode ? "+70000000000" : "");

  const [docLimits, setDocLimits] = useState<DocLimits | null>(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  const [inn, setInn] = useState("");
  const [fullName, setFullName] = useState(() => {
    try { return JSON.parse(localStorage.getItem("requisites") || "{}").fullName || ""; } catch { return ""; }
  });
  const [innSaved, setInnSaved] = useState(false);
  const [isSelfEmployed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    // В гостевом режиме (?demo=1) не подтягиваем свою сессию — иначе
    // открылся бы личный кабинет вместо демонстрационного.
    if (!token || isDemo) { setAuthChecked(true); return; }
    authApi.me().then(({ status, data }) => {
      if (status === 200 && data.user) {
        setUser(data.user);
        if (data.user.phone) localStorage.setItem("userPhone", data.user.phone);
      } else {
        clearAuth();
      }
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));

    if (paymentResult === "success") {
      // Попал ли человек в 12 участников акции — тогда сразу показываем анкету
      fetch("https://functions.poehali.dev/b9cceef8-d56c-4b6d-9fbb-85f2732e8839", {
        headers: { "X-Auth-Token": localStorage.getItem("authToken") || "" },
      })
        .then((r) => r.json())
        .then((d) => { if (d?.has_slot && !d?.brief_sent) setShowBrief(true); })
        .catch(() => undefined);
    }

    if (paymentResult) {
      reachGoal(paymentResult === "success" ? "payment_success" : "payment_fail");
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const reloadLimits = () => {
    if (!phone) return;
    fetchDocLimits(phone).then((data) => {
      if (data) setDocLimits(data);
    });
  };

  // Загружаем лимиты при входе и показываем окно, если осталось 3 и меньше
  useEffect(() => {
    if (!phone) return;
    fetchDocLimits(phone).then((data) => {
      if (!data) return;
      setDocLimits(data);
      if (!data.unlimited && data.limit !== null && (data.remaining ?? 0) <= 3) {
        setLimitDialogOpen(true);
      }
    });
  }, [phone]);

  const handleChangePlan = () => {
    setLimitDialogOpen(false);
    setActiveTab("account");
    toast("Откройте «Тариф», чтобы сменить план", { icon: "💳" });
  };

  const handleBuyPack = () => {
    toast("Докупка пакета документов скоро появится", { icon: "📦" });
  };

  const [showTrialCode, setShowTrialCode] = useState(false);

  const maybeShowTrialCode = (u: AuthUser) => {
    if (u.role === "admin" || u.plan || u.trial_started_at) return;
    const seenKey = `trialCodeSeen_${u.id}`;
    if (localStorage.getItem(seenKey)) return;
    localStorage.setItem(seenKey, "1");
    setShowTrialCode(true);
  };

  const handleAuth = (u: AuthUser) => {
    setUser(u);
    setDemoMode(false);
    if (u.phone) localStorage.setItem("userPhone", u.phone);
    if (u.profile_completed) maybeShowTrialCode(u);
  };

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuth();
    setUser(null);
    setDemoMode(false);
    setActiveTab("home");
  };

  // Заглушка «Скоро запуск»: включается Заведующей в её кабинете.
  // Обходят её только ссылки ?enter=1 (мой вход) и ?demo=1 (мой Гость).
  if (maintenance === null || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(36 25% 96%)" }}>
        <Icon name="Loader" size={28} className="animate-spin text-primary" />
      </div>
    );
  }
  if (maintenance && !hasEarlyAccess) {
    return <ComingSoon />;
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
    return <ProfileSetup user={user} onDone={(u) => { setUser(u); maybeShowTrialCode(u); }} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto"
      style={{ background: "linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}
    >
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-end gap-1.5 mb-4">
          <img src="/logo-capydoc.png" alt="CapyDoc.ru" width="34" height="34" className="flex-shrink-0 rounded-lg" />
          <div className="flex flex-col items-stretch leading-none">
            <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: "hsl(24 20% 13%)" }}>
              Сервис
            </span>
            <span className="font-cormorant font-semibold text-lg leading-tight whitespace-nowrap">
              <span style={{ color: "hsl(35 72% 42%)" }}>Capy</span><span style={{ color: "hsl(24 20% 13%)" }}>Doc.ru</span>
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5 truncate">
              {user?.role === "admin" ? "Кабинет Заведующей" : "Добро пожаловать"}
            </p>
            <h1 className="font-cormorant text-2xl font-semibold text-foreground truncate">
              {user?.role === "admin" && activeTab === "account"
                ? "Пользователи"
                : user?.full_name || (demoMode ? "Гость" : "Пользователь")}
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
            <AdminDashboard section={adminSection} onSection={setAdminSection} />
          ) : (
            <HomeTab
              colorTheme={colorTheme}
              todayPhrase={todayPhrase}
              setActiveTab={setActiveTab}
              phone={phone}
              userPlan={user?.plan ?? null}
              userRole={user?.role}
              docLimits={docLimits}
              onShowLimit={() => setLimitDialogOpen(true)}
              planExpiresAt={user?.plan_expires_at ?? null}
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
          activityDescription={user?.activity_description ?? null}
          userEmail={user?.email}
          userRole={user?.role}
          userPlan={user?.plan ?? null}
          planExpiresAt={user?.plan_expires_at ?? null}
          familyRequestStatus={user?.family_request_status ?? null}
          trialStartedAt={user?.trial_started_at ?? null}
          onUserUpdated={setUser}
          onDocCreated={reloadLimits}
          onGoToAccount={() => {
            try { sessionStorage.setItem("openRequisites", "1"); } catch { /* ignore */ }
            setActiveTab("account");
          }}
        />
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} userRole={user?.role}
        adminSection={adminSection} onAdminSection={setAdminSection} />

      {showBrief && <TemplateBriefModal onClose={() => setShowBrief(false)} />}

      <LimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        limits={docLimits}
        onChangePlan={handleChangePlan}
        onBuyPack={handleBuyPack}
      />

      {showTrialCode && (
        <TrialCodeModal
          onClose={() => setShowTrialCode(false)}
          onActivated={(u) => { setUser(u); toast("Тестовый тариф активирован на 3 дня", { icon: "🎟" }); }}
        />
      )}
    </div>
  );
}