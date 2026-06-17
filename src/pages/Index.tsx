import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import LoginScreen from "@/components/app/LoginScreen";
import HomeTab from "@/components/app/HomeTab";
import TabContent from "@/components/app/TabContent";
import BottomNav from "@/components/app/BottomNav";

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
    if (colorTheme === "honey" || colorTheme === "clay") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", colorTheme);
    }
  }, [colorTheme]);

  useEffect(() => {
    const saved = localStorage.getItem("colorTheme") as keyof typeof themes | null;
    if (saved && saved !== "honey" && saved !== "clay") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  const [isLoggedIn, setIsLoggedIn] = useState(isDemo);
  const [loginStep, setLoginStep] = useState<"phone" | "code" | "status">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [inn, setInn] = useState("");
  const [fullName, setFullName] = useState("Анна Смирнова");
  const [innSaved, setInnSaved] = useState(false);
  const [isSelfEmployed, setIsSelfEmployed] = useState<boolean | null>(null);
  const [userStatus, setUserStatus] = useState<"self_employed" | "ip" | "ooo" | "individual" | null>(null);

  if (!isLoggedIn) {
    return (
      <LoginScreen
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        loginStep={loginStep}
        setLoginStep={setLoginStep}
        phone={phone}
        setPhone={setPhone}
        code={code}
        setCode={setCode}
        userStatus={userStatus}
        setUserStatus={setUserStatus}
        setIsSelfEmployed={setIsSelfEmployed}
        setIsLoggedIn={setIsLoggedIn}
      />
    );
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
            <p className="text-xs text-muted-foreground mb-0.5">Добро пожаловать</p>
            <h1 className="font-cormorant text-2xl font-semibold text-foreground">Анна Смирнова</h1>
          </div>
          <button className="relative">
            <div className="w-10 h-10 rounded-2xl gold-gradient flex items-center justify-center shadow-sm">
              <span className="font-cormorant text-lg font-bold text-white">АС</span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </button>
        </div>

      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-28 space-y-6">
        {activeTab === "home" && (
          <HomeTab
            colorTheme={colorTheme}
            todayPhrase={todayPhrase}
            setActiveTab={setActiveTab}
          />
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
          setIsLoggedIn={setIsLoggedIn}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
        />
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}