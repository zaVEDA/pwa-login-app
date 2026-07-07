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
  userRole?: string;
  userPlan?: PlanType | null;
  onUserUpdated?: (user: AuthUser) => void;
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
  userRole,
  userPlan,
  onUserUpdated,
}: Props) {
  return (
    <>
      {activeTab === "docs" && <DocsTab phone={phone} userPlan={userPlan} />}

      <TemplatesTab activeTab={activeTab} />

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
          userRole={userRole}
          userPlan={userPlan}
          onUserUpdated={onUserUpdated}
        />
      )}
    </>
  );
}