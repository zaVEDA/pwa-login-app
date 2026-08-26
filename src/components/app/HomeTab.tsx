import { useState } from "react";
import Icon from "@/components/ui/icon";
import InvoiceModal from "@/components/app/InvoiceModal";
import CreateDocMenu from "@/components/app/CreateDocMenu";
import TemplateFillModal from "@/components/app/templates/TemplateFillModal";
import { templateDocs, PERSONAL_DATA_TITLE } from "@/components/app/templates/docs";
import { PlanType } from "@/lib/auth";
import { DocLimits } from "@/lib/limits";

type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

const themes = {
  honey: {
    label: "Янтарь",
    phraseIcon: "Leaf",
    phraseBg: "linear-gradient(135deg, hsl(40 60% 93%), hsl(38 50% 90%))",
    phraseBorder: "hsl(38 40% 82%)",
    phraseIconBg: "hsl(38 60% 85%)",
    phraseIconColor: "text-amber-700",
    phraseLabel: "text-amber-600",
    phraseText: "text-amber-950",
  },
  sage: {
    label: "Шалфей",
    phraseIcon: "Sprout",
    phraseBg: "linear-gradient(135deg, hsl(140 25% 92%), hsl(145 20% 89%))",
    phraseBorder: "hsl(140 20% 80%)",
    phraseIconBg: "hsl(140 30% 84%)",
    phraseIconColor: "text-emerald-700",
    phraseLabel: "text-emerald-600",
    phraseText: "text-emerald-950",
  },
  rose: {
    label: "Роза",
    phraseIcon: "Flower2",
    phraseBg: "linear-gradient(135deg, hsl(345 40% 93%), hsl(340 35% 90%))",
    phraseBorder: "hsl(345 30% 82%)",
    phraseIconBg: "hsl(345 40% 86%)",
    phraseIconColor: "text-rose-600",
    phraseLabel: "text-rose-500",
    phraseText: "text-rose-950",
  },
  clay: {
    label: "Глина",
    phraseIcon: "TreePine",
    phraseBg: "linear-gradient(135deg, hsl(20 40% 92%), hsl(18 35% 89%))",
    phraseBorder: "hsl(20 30% 81%)",
    phraseIconBg: "hsl(20 40% 84%)",
    phraseIconColor: "text-orange-800",
    phraseLabel: "text-orange-700",
    phraseText: "text-orange-950",
  },
} as const;

interface Props {
  colorTheme: keyof typeof themes;
  todayPhrase: string;
  setActiveTab: (t: Tab) => void;
  phone: string;
  userPlan?: PlanType | null;
  userRole?: string;
  userEmail?: string | null;
  docLimits?: DocLimits | null;
  onShowLimit?: () => void;
  planExpiresAt?: string | null;
  onGoToAccount?: () => void;
}

export default function HomeTab({ colorTheme, todayPhrase, setActiveTab, phone, userPlan, userRole, userEmail, docLimits, onShowLimit, planExpiresAt, onGoToAccount }: Props) {
  const theme = themes[colorTheme];
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newAgreementDoc, setNewAgreementDoc] = useState<string | null>(null);
  const isAdmin = userRole === "admin";

  const showLimitBanner =
    !!docLimits && !docLimits.unlimited && docLimits.limit !== null && (docLimits.remaining ?? 0) <= 3;
  const remaining = docLimits?.remaining ?? 0;

  // Подписка закончилась и не продлена: показываем предупреждение об удалении
  // документов в течение 7 дней после окончания (кроме бесплатного тарифа «family»).
  let expiredDaysLeft: number | null = null;
  if (planExpiresAt && userPlan && userPlan !== "family") {
    const expired = new Date(planExpiresAt);
    const now = new Date();
    if (expired.getTime() < now.getTime()) {
      const daysSince = Math.floor((now.getTime() - expired.getTime()) / 86400000);
      if (daysSince < 7) expiredDaysLeft = 7 - daysSince;
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {showInvoice && <InvoiceModal onClose={() => setShowInvoice(false)} phone={phone} userPlan={userPlan} />}
      {newAgreementDoc && templateDocs[newAgreementDoc] && (
        <TemplateFillModal
          doc={templateDocs[newAgreementDoc]}
          phone={phone}
          userProfile={{ phone, email: userEmail }}
          onClose={() => setNewAgreementDoc(null)}
          onGoToAccount={() => { setNewAgreementDoc(null); onGoToAccount?.(); }}
        />
      )}

      {/* Подписка закончилась — предупреждение об удалении документов */}
      {!isAdmin && expiredDaysLeft !== null && (
        <div className="w-full rounded-2xl p-4 border bg-red-50 border-red-200 flex gap-3 items-start">
          <Icon name="TriangleAlert" size={18} className="flex-shrink-0 mt-0.5 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-700">
              Подписка закончилась
            </p>
            <p className="text-xs mt-0.5 text-red-600 leading-relaxed">
              Сохраните нужные документы — через {expiredDaysLeft}{" "}
              {expiredDaysLeft === 1 ? "день" : expiredDaysLeft < 5 ? "дня" : "дней"} они будут автоматически удалены.
            </p>
            <button
              onClick={() => setActiveTab("account")}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-700 underline underline-offset-2"
            >
              <Icon name="RefreshCw" size={12} />
              Продлить подписку
            </button>
          </div>
        </div>
      )}

      {/* Баннер о приближении к лимиту документов */}
      {!isAdmin && showLimitBanner && (
        <button
          onClick={onShowLimit}
          className={`w-full text-left rounded-2xl p-4 border flex gap-3 items-start active:scale-[0.99] transition-transform ${
            remaining <= 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
          }`}
        >
          <Icon
            name={remaining <= 0 ? "OctagonAlert" : "TriangleAlert"}
            size={18}
            className={`flex-shrink-0 mt-0.5 ${remaining <= 0 ? "text-red-600" : "text-amber-600"}`}
          />
          <div className="min-w-0">
            <p className={`text-sm font-medium ${remaining <= 0 ? "text-red-700" : "text-amber-800"}`}>
              {remaining <= 0 ? "Лимит документов исчерпан" : `Осталось ${remaining} документов в этом месяце`}
            </p>
            <p className={`text-xs mt-0.5 ${remaining <= 0 ? "text-red-600" : "text-amber-700"}`}>
              Нажмите, чтобы докупить пакет или сменить тариф
            </p>
          </div>
        </button>
      )}
      {/* Мотивирующая фраза дня */}
      <div className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: theme.phraseBg, border: `1px solid ${theme.phraseBorder}` }}>
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: theme.phraseIconBg }}>
            <Icon name={theme.phraseIcon} size={16} className={theme.phraseIconColor} />
          </div>
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${theme.phraseLabel}`}>Мысль дня</p>
            <p className={`font-cormorant text-lg font-medium leading-snug italic ${theme.phraseText}`}>«{todayPhrase}»</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {!isAdmin && <div>
        <h2 className="font-cormorant text-xl font-semibold mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { try { sessionStorage.setItem("openPlanModal", "1"); } catch { /* ignore */ } setActiveTab("account"); }}
            className="card-dark rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <Icon name="Crown" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Тариф</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ознакомиться и выбрать</p>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name="UserCircle" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Аккаунт</p>
            <p className="text-xs text-muted-foreground mt-0.5">Личный кабинет и мои данные</p>
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className="card-warm rounded-2xl p-4 text-left active:scale-[0.97] transition-transform border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon name="LayoutTemplate" size={18} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Шаблоны</p>
            <p className="text-xs text-muted-foreground mt-0.5">Под вашу деятельность</p>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu((v) => !v)}
              className="w-full card-dark rounded-2xl p-4 text-left active:scale-[0.97] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                <Icon name="FilePlus" size={18} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Создать документ</p>
              <p className="text-xs text-muted-foreground mt-0.5">Договор, акт, счёт</p>
            </button>
            {showCreateMenu && (
              <div
                className="fixed inset-0 z-[70] flex flex-col items-center pt-6 px-4"
                style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}
              >
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateMenu(false)} />
                <div className="relative w-full bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <CreateDocMenu
                    onClose={() => setShowCreateMenu(false)}
                    onPersonalData={() => { setShowCreateMenu(false); setNewAgreementDoc(PERSONAL_DATA_TITLE); }}
                    onInvoice={() => { setShowCreateMenu(false); setShowInvoice(true); }}
                    onAgreementSelect={(title) => { setShowCreateMenu(false); setNewAgreementDoc(title); }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>}

      {/* Tax reminder */}
      {!isAdmin && <div
        className="rounded-2xl p-4 border border-primary/30"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.07))" }}
      >
        <div className="flex gap-3 items-start mb-3">
          <Icon name="Bell" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-700 leading-snug mb-1">В активной разработке</p>
            <p className="text-sm font-medium text-foreground">Налог за май</p>
            <p className="text-xs text-muted-foreground mt-0.5">До 25 июня нужно оплатить ₽1 872 в приложении «Мой налог»</p>
          </div>
        </div>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.open("https://lknpd.nalog.ru/", "_blank"); }}
          className="w-full py-2 rounded-xl bg-primary/15 text-primary text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <Icon name="ExternalLink" size={12} />
          Открыть «Мой налог»
        </a>
      </div>}
    </div>
  );
}