import Icon from "@/components/ui/icon";
import { AuthUser } from "@/lib/auth";
import { useLoginScreen, Mode } from "./login/useLoginScreen";
import LoginHeader from "./login/LoginHeader";
import LoginRegisterForm from "./login/LoginRegisterForm";
import LoginOtherForms from "./login/LoginOtherForms";
import LoginConsentModal from "./login/LoginConsentModal";

interface Props {
  selectedSpecialty: string | null;
  setSelectedSpecialty: (v: string | null) => void;
  onAuth: (user: AuthUser) => void;
  onDemo: () => void;
}

export default function LoginScreen({ selectedSpecialty, setSelectedSpecialty, onAuth, onDemo }: Props) {
  const m = useLoginScreen({ onAuth });
  const { mode, phone, error, devCode, showConsent, setShowConsent, acceptAllConsents } = m;

  // Кнопка гостевого входа скрыта из публичного UI — вход в демо-режим
  // возможен только по личной ссылке /guest.
  const showGuestEntry = false;

  const errBlock = error && (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
      <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-600">{error}</p>
    </div>
  );

  const devBlock = devCode && (
    <p className="text-[11px] text-center text-muted-foreground">Демо-режим: код <span className="font-semibold text-primary">{devCode}</span></p>
  );

  const titles: Record<Mode, string> = {
    phone: "Регистрация и вход",
    code: "Введите код из SMS",
    password: "Вход по паролю",
    recover: "Восстановление доступа",
    recover_code: "Введите код",
    recover_new: "Новый пароль",
    admin: "Вход для Заведующей",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-8 px-5 overflow-y-auto"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 50%, hsl(30 25% 87%) 100%)" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <LoginHeader
          showSpecialties={mode === "phone"}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
        />

        {/* Card */}
        <div className="card-warm rounded-2xl p-6 shadow-lg shadow-amber-900/10 space-y-4">
          <div>
            <h2 className="font-cormorant text-2xl font-semibold mb-1">{titles[mode]}</h2>
            <p className="text-muted-foreground text-sm">
              {mode === "phone" && "Телефон, email и пароль — вход по СМС"}
              {mode === "code" && `Код отправлен на ${phone}`}
              {mode === "password" && "Устройство распознано — введите пароль"}
              {mode === "recover" && "Выберите способ восстановления"}
              {mode === "recover_code" && "Введите код из сообщения"}
              {mode === "recover_new" && "Придумайте новый пароль"}
              {mode === "admin" && "Логин и пароль Заведующей"}
            </p>
          </div>

          {errBlock}

          {/* PHONE / REGISTER */}
          {mode === "phone" && <LoginRegisterForm m={m} />}

          <LoginOtherForms m={m} devBlock={devBlock} />
        </div>

        {mode === "phone" && showGuestEntry && (
          <button onClick={onDemo}
            className="w-full mt-4 py-2.5 rounded-xl gold-gradient text-white text-xs font-medium shadow-sm shadow-amber-900/20 active:scale-[0.98] transition-transform">
            Посмотреть без регистрации →
          </button>
        )}
      </div>

      {/* Модалка: текст согласия на обработку персональных данных */}
      {showConsent && (
        <LoginConsentModal
          onClose={() => setShowConsent(false)}
          onAccept={() => { acceptAllConsents(); setShowConsent(false); }}
        />
      )}
    </div>
  );
}