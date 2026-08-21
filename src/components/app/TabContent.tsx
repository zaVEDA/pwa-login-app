import { Tab, themes } from "./tabs/constants";
import DocsTab from "./tabs/DocsTab";
import TemplatesTab from "./tabs/TemplatesTab";
import AccountTab from "./tabs/AccountTab";
import { AuthUser, PlanType } from "@/lib/auth";

interface Props {
  activeTab: Tab;
  isSelfEmployed: boolean | null;
  inn: string;
  setInn: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  innSaved: boolean;
  setInnSaved: (v: boolean) => void;
  onLogout: () => void;
  colorTheme: keyof typeof themes;
  setColorTheme: (t: keyof typeof themes) => void;
  phone: string;
  userName?: string | null;
  activityDescription?: string | null;
  userEmail?: string | null;
  userRole?: string;
  userPlan?: PlanType | null;
  planExpiresAt?: string | null;
  familyRequestStatus?: "pending" | "approved" | "rejected" | null;
  trialStartedAt?: string | null;
  onUserUpdated?: (user: AuthUser) => void;
  onDocCreated?: () => void;
  onGoToAccount?: () => void;
}

export default function TabContent({
  activeTab,
  isSelfEmployed,
  inn,
  setInn,
  fullName,
  setFullName,
  innSaved,
  setInnSaved,
  onLogout,
  colorTheme,
  setColorTheme,
  phone,
  userName,
  activityDescription,
  userEmail,
  userRole,
  userPlan,
  planExpiresAt,
  familyRequestStatus,
  trialStartedAt,
  onUserUpdated,
  onDocCreated,
  onGoToAccount,
}: Props) {
  return (
    <>
      {activeTab === "docs" && <DocsTab phone={phone} userPlan={userPlan} onDocCreated={onDocCreated} userEmail={userEmail} onGoToAccount={onGoToAccount} />}

      <TemplatesTab activeTab={activeTab} phone={phone} onSaved={onDocCreated} userEmail={userEmail} onGoToAccount={onGoToAccount} />

      {activeTab === "account" && (
        <AccountTab
          isSelfEmployed={isSelfEmployed}
          fullName={fullName}
          setFullName={setFullName}
          onLogout={onLogout}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          phone={phone}
          userName={userName}
          activityDescription={activityDescription}
          userRole={userRole}
          userPlan={userPlan}
          planExpiresAt={planExpiresAt}
          familyRequestStatus={familyRequestStatus}
          trialStartedAt={trialStartedAt}
          onUserUpdated={onUserUpdated}
        />
      )}
    </>
  );
}