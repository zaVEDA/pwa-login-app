import { useState } from "react";
import Icon from "@/components/ui/icon";
import RequisitesBlock from "@/components/app/RequisitesBlock";
import AdminUsers from "@/components/admin/AdminUsers";
import PlanModal from "@/components/app/PlanModal";
import { AuthUser, PlanType } from "@/lib/auth";
import { themes } from "./constants";

const planLabels: Record<PlanType, string> = {
  start: "Начальный",
  medium: "Средний",
  pro: "Про",
  family: "Для родных",
};

interface Props {
  isSelfEmployed: boolean | null;
  fullName: string;
  setFullName: (v: string) => void;
  onLogout: () => void;
  colorTheme: keyof typeof themes;
  setColorTheme: (t: keyof typeof themes) => void;
  phone: string;
  userName?: string | null;
  userRole?: string;
  userPlan?: PlanType | null;
  onUserUpdated?: (user: AuthUser) => void;
}

export default function AccountTab({
  isSelfEmployed,
  fullName,
  setFullName,
  onLogout,
  colorTheme,
  setColorTheme,
  phone,
  userName,
  userRole,
  userPlan,
  onUserUpdated,
}: Props) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  return (
    <>
      {userRole === "admin" && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-cormorant text-2xl font-semibold">Пользователи</h2>
            <button onClick={onLogout} className="text-xs text-red-500 flex items-center gap-1">
              <Icon name="LogOut" size={13} /> Выйти
            </button>
          </div>
          <AdminUsers />
        </div>
      )}

      {userRole !== "admin" && (
        <div className="space-y-5 animate-slide-up">
          {/* Profile card */}
          <div className="card-dark rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 shimmer" />
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                <span className="font-cormorant text-2xl font-bold text-white">
                  {(userName || "Г").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "Г"}
                </span>
              </div>
              <div>
                <h3 className="font-cormorant text-xl font-semibold text-foreground">{userName || "Гость"}</h3>
                <p className="text-sm text-muted-foreground">{phone || "—"}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name={userRole === "admin" ? "Shield" : "Briefcase"} size={11} className="text-primary" />
                  <span className="text-xs text-primary">{userRole === "admin" ? "Администратор" : "Личный кабинет"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Тариф */}
          <button
            onClick={() => setShowPlanModal(true)}
            className="w-full card-warm rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Crown" size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Тариф</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {userPlan ? planLabels[userPlan] : "Не выбран — нажмите, чтобы выбрать"}
              </p>
            </div>
            <Icon name="ChevronRight" size={15} className="text-muted-foreground flex-shrink-0" />
          </button>

          {showPlanModal && (
            <PlanModal
              currentPlan={userPlan ?? null}
              onClose={() => setShowPlanModal(false)}
              onSelected={(u) => onUserUpdated?.(u)}
            />
          )}

          {/* Цветовая тема */}
          <div className="card-warm rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Palette" size={15} className="text-primary" />
              <p className="text-sm font-medium">Тема</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(themes) as [keyof typeof themes, typeof themes[keyof typeof themes]][]).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    colorTheme === key
                      ? "bg-foreground text-background border-transparent shadow-sm"
                      : "bg-white/60 border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Icon name={t.phraseIcon} size={11} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Реквизиты */}
          <RequisitesBlock fullName={fullName} setFullName={setFullName} phone={phone} />

          {/* Мой налог — только для самозанятых */}
          {isSelfEmployed && <div
            className="rounded-2xl p-4 border border-primary/30"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.07))" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon name="Receipt" size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Выбить чек самозанятого</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Откроет официальное приложение ФНС «Мой налог» для выдачи чека клиенту
                </p>
              </div>
            </div>
            <a
              href="mynalog://register"
              onClick={(e) => { e.preventDefault(); window.open("https://lknpd.nalog.ru/", "_blank"); }}
              className="mt-3 w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Icon name="ExternalLink" size={14} />
              Открыть «Мой налог»
            </a>
          </div>}

          {/* Settings list */}
          <div className="space-y-2">
            {[
              { icon: "User", label: "Профиль и деятельность", danger: false },
              { icon: "FileSignature", label: "Настройки подписи (ПЭП)", danger: false },
              { icon: "Bell", label: "Уведомления", danger: false },
              { icon: "BarChart3", label: "Учёт и налоги", danger: false },
              { icon: "HelpCircle", label: "Справка и поддержка", danger: false },
              { icon: "LogOut", label: "Выйти", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.label === "Выйти" ? onLogout : undefined}
                className={`w-full card-warm rounded-xl p-3.5 flex items-center gap-3 text-left shadow-sm active:scale-[0.98] transition-transform ${item.danger ? "border border-red-200/50" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.danger ? "bg-red-50" : "bg-primary/10"}`}>
                  <Icon name={item.icon} size={15} className={item.danger ? "text-red-500" : "text-primary"} />
                </div>
                <span className={`flex-1 text-sm ${item.danger ? "text-red-500" : "text-foreground"}`}>{item.label}</span>
                {!item.danger && <Icon name="ChevronRight" size={15} className="text-muted-foreground" />}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground pb-2">ЗаВедующая · версия 1.0.0</p>
        </div>
      )}
    </>
  );
}