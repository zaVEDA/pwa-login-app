import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import RequisitesBlock from "@/components/app/RequisitesBlock";
import AdminRealUsers from "@/components/admin/AdminRealUsers";
import TemplateBriefModal from "@/components/promo/TemplateBriefModal";
import SupportModal from "@/components/app/SupportModal";
import { useTemplateSlot } from "@/components/promo/useTemplateSlot";
import PlanModal from "@/components/app/PlanModal";
import ChangePasswordModal from "@/components/app/ChangePasswordModal";
import ProfileActivityModal from "@/components/app/ProfileActivityModal";
import ClientsModal from "@/components/app/ClientsModal";
import NotificationsModal from "@/components/app/NotificationsModal";
import { AuthUser, PlanType } from "@/lib/auth";
import { fetchDocLimits, DocLimits } from "@/lib/limits";
import { notifyApi } from "@/lib/notifications";
import { themes } from "./constants";

const planLabels: Record<PlanType, string> = {
  start: "Опора",
  medium: "Рост",
  pro: "Творец",
  family: "Для родных",
  test: "ТЕСТ",
  trial: "Тест-драйв",
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
  activityDescription?: string | null;
  userRole?: string;
  userPlan?: PlanType | null;
  planExpiresAt?: string | null;
  familyRequestStatus?: "pending" | "approved" | "rejected" | null;
  trialStartedAt?: string | null;
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
  activityDescription,
  userRole,
  userPlan,
  planExpiresAt,
  familyRequestStatus,
  trialStartedAt,
  onUserUpdated,
}: Props) {
  const [showPlanModal, setShowPlanModal] = useState(() => {
    try { return sessionStorage.getItem("openPlanModal") === "1"; } catch { return false; }
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [unread, setUnread] = useState(0);
  const [limits, setLimits] = useState<DocLimits | null>(null);

  useEffect(() => {
    if (phone) fetchDocLimits(phone).then(setLimits);
  }, [phone]);

  useEffect(() => {
    if (showPlanModal) {
      try { sessionStorage.removeItem("openPlanModal"); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    notifyApi.list().then((r) => {
      if (r.status === 200) setUnread(r.data.unread || 0);
    });
  }, []);

  const { slot, reload: reloadSlot } = useTemplateSlot(userRole !== "admin");
  const [briefOpen, setBriefOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      {userRole === "admin" && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-end">
            <button onClick={onLogout} className="text-xs text-red-500 flex items-center gap-1">
              <Icon name="LogOut" size={13} /> Выйти
            </button>
          </div>
          <AdminRealUsers />
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
                  <span className="text-xs text-primary">{userRole === "admin" ? "Заведующая" : "Личный кабинет"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Реквизиты */}
          <RequisitesBlock fullName={fullName} setFullName={setFullName} phone={phone} />

          {/* Тариф */}
          <button
            onClick={() => setShowPlanModal(true)}
            className="w-full gold-gradient rounded-2xl p-4 shadow-md flex items-center gap-3 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 shimmer" />
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10">
              <Icon name="Crown" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <p className="text-sm font-semibold text-white">Тариф</p>
              <p className="text-xs text-white/85 mt-0.5">
                {userPlan
                  ? `${planLabels[userPlan]}${userPlan !== "family" && planExpiresAt ? ` · до ${new Date(planExpiresAt).toLocaleDateString("ru-RU")}` : ""}`
                  : "Не выбран — нажмите, чтобы выбрать"}
              </p>
            </div>
            <Icon name="ChevronRight" size={16} className="text-white/90 flex-shrink-0 relative z-10" />
          </button>

          {/* Акция «12 шаблонов»: напоминание заполнить анкету */}
          {slot?.has_slot && !slot.brief_sent && (
            <button
              onClick={() => setBriefOpen(true)}
              className="w-full rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-[0.98] transition-transform border"
              style={{
                background: "linear-gradient(150deg, hsl(45 60% 96%), hsl(38 48% 92%))",
                borderColor: "hsl(35 55% 72%)",
              }}
            >
              <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                <Icon name="Gift" size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "hsl(24 30% 16%)" }}>
                  Ваш шаблон в подарок ждёт
                </p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(24 18% 34%)" }}>
                  Заполните анкету — и мы разработаем документ
                </p>
              </div>
              <Icon name="ChevronRight" size={15} className="flex-shrink-0" style={{ color: "hsl(35 72% 42%)" }} />
            </button>
          )}

          {/* Остаток документов на месяц — скрываем для гостя (демо-режим) */}
          {phone !== "+70000000000" && limits && !limits.unlimited && limits.limit !== null && (
            <div className="card-warm rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  (limits.remaining ?? 0) <= 3 ? "bg-amber-100" : "bg-primary/10"
                }`}>
                  <Icon name="FileText" size={16} className={(limits.remaining ?? 0) <= 3 ? "text-amber-600" : "text-primary"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Документы в этом месяце</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Осталось {limits.remaining ?? 0} из {limits.limit}
                  </p>
                </div>
                <p className="font-cormorant text-2xl font-semibold text-foreground flex-shrink-0">
                  {limits.remaining ?? 0}
                </p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-border/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${(limits.remaining ?? 0) <= 3 ? "bg-amber-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(100, Math.round((limits.used / limits.limit) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {limits && limits.unlimited && userPlan && (
            <div className="card-warm rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Infinity" size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Документы</p>
                <p className="text-xs text-muted-foreground mt-0.5">Без ограничений на вашем тарифе</p>
              </div>
            </div>
          )}

          {showPlanModal && (
            <PlanModal
              currentPlan={userPlan ?? null}
              isAdmin={userRole === "admin"}
              familyRequestStatus={familyRequestStatus}
              trialStartedAt={trialStartedAt}
              onClose={() => setShowPlanModal(false)}
              onSelected={(u) => { onUserUpdated?.(u); setShowPlanModal(false); }}
            />
          )}

          {showPasswordModal && (
            <ChangePasswordModal
              onClose={() => setShowPasswordModal(false)}
              onSaved={(u) => onUserUpdated?.(u)}
            />
          )}

          {showProfileModal && (
            <ProfileActivityModal
              fullName={userName || fullName}
              phone={phone}
              user={{ full_name: userName ?? null, activity_description: activityDescription ?? null } as AuthUser}
              onClose={() => setShowProfileModal(false)}
              onSaved={(u) => { onUserUpdated?.(u); setFullName(u.full_name || ""); }}
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

          {/* Мои клиенты */}
          <button
            onClick={() => setShowClientsModal(true)}
            className="w-full card-warm rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Users" size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Мои клиенты</p>
              <p className="text-xs text-muted-foreground mt-0.5">Справочник клиентов и поиск по телефону</p>
            </div>
            <Icon name="ChevronRight" size={15} className="text-muted-foreground flex-shrink-0" />
          </button>

          {showClientsModal && <ClientsModal phone={phone} onClose={() => setShowClientsModal(false)} />}

          {showNotifyModal && (
            <NotificationsModal onClose={() => setShowNotifyModal(false)} onReadAll={() => setUnread(0)} />
          )}

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
              { icon: "KeyRound", label: "Сменить пароль", danger: false },
              { icon: "Bell", label: "Уведомления", danger: false },
              { icon: "HelpCircle", label: "Справка и поддержка", danger: false },
              { icon: "LogOut", label: "Выйти", danger: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={
                  item.label === "Выйти"
                    ? onLogout
                    : item.label === "Сменить пароль"
                    ? () => setShowPasswordModal(true)
                    : item.label === "Профиль и деятельность"
                    ? () => setShowProfileModal(true)
                    : item.label === "Уведомления"
                    ? () => setShowNotifyModal(true)
                    : item.label === "Справка и поддержка"
                    ? () => setSupportOpen(true)
                    : undefined
                }
                className={`w-full card-warm rounded-xl p-3.5 flex items-center gap-3 text-left shadow-sm active:scale-[0.98] transition-transform ${item.danger ? "border border-red-200/50" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.danger ? "bg-red-50" : "bg-primary/10"}`}>
                  <Icon name={item.icon} size={15} className={item.danger ? "text-red-500" : "text-primary"} />
                </div>
                <span className={`flex-1 text-sm ${item.danger ? "text-red-500" : "text-foreground"}`}>{item.label}</span>
                {item.label === "Уведомления" && unread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[11px] font-medium flex items-center justify-center">
                    {unread}
                  </span>
                )}
                {!item.danger && <Icon name="ChevronRight" size={15} className="text-muted-foreground" />}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground pb-2">CapyDoc.ru · версия 1.0.0</p>
        </div>
      )}

      {briefOpen && (
        <TemplateBriefModal onClose={() => { setBriefOpen(false); reloadSlot(); }} />
      )}

      {supportOpen && (
        <SupportModal
          hasTemplateSlot={!!slot?.has_slot && !slot.brief_sent}
          onOpenBrief={() => { setSupportOpen(false); setBriefOpen(true); }}
          onClose={() => setSupportOpen(false)}
        />
      )}
    </>
  );
}