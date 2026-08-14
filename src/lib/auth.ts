const AUTH_URL = "https://functions.poehali.dev/014fc1d1-8785-4bdb-8c38-bc1b5126ef4b";

export type PlanType = "start" | "medium" | "pro" | "family";

export interface AuthUser {
  id: number;
  phone: string;
  full_name: string | null;
  email: string | null;
  email_verified: boolean;
  login: string | null;
  role: string;
  consent_pep: boolean;
  profile_completed: boolean;
  status: string | null;
  plan: PlanType | null;
  plan_expires_at: string | null;
  family_request_status: "pending" | "approved" | "rejected" | null;
}

export interface FamilyRequestItem {
  id: number;
  user_id: number;
  full_name: string | null;
  phone: string;
  code_word: string;
  status: "pending" | "approved" | "rejected";
  created_at: string | null;
}

export function getDeviceId(): string {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem("deviceId", id);
  }
  return id;
}

export function getToken(): string {
  return localStorage.getItem("authToken") || "";
}

export function setToken(token: string) {
  localStorage.setItem("authToken", token);
}

export function clearAuth() {
  localStorage.removeItem("authToken");
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": getDeviceId(),
      "X-Auth-Token": getToken(),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  const parsed = typeof data === "string" ? JSON.parse(data) : data;
  return { status: res.status, data: parsed };
}

export const authApi = {
  requestCode: (p: { purpose: string; channel: string; phone?: string; email?: string; password?: string; consent?: boolean; consent_personal?: boolean; consent_offer?: boolean; consent_pep?: boolean; captcha_pass_token?: string }) =>
    call("request_code", p),
  verifyCode: (p: { purpose: string; channel: string; phone?: string; email?: string; code: string }) =>
    call("verify_code", p),
  loginPassword: (p: { login: string; password: string }) => call("login_password", p),
  checkDevice: (phone: string) => call("check_device", { phone }),
  me: () => call("me"),
  updateProfile: (p: { full_name?: string; email?: string; login?: string; password?: string }) =>
    call("update_profile", p),
  resetPassword: (password: string) => call("reset_password", { password }),
  requestFamilyPlan: (code_word: string) => call("request_family_plan", { code_word }),
  adminListFamilyRequests: () => call("admin_list_family_requests"),
  adminDecideFamilyRequest: (request_id: number, decision: "approved" | "rejected", plan_expires_at?: string) =>
    call("admin_decide_family_request", { request_id, decision, plan_expires_at }),
  adminGetFamilyCode: () => call("admin_get_family_code"),
  adminSetFamilyCode: (code_word: string, expires_at: string | null) =>
    call("admin_set_family_code", { code_word, expires_at }),
  adminSetUserPassword: (login: string, password: string) =>
    call("admin_set_user_password", { login, password }),
  adminGrantAccess: (p: { target: "app" | "lawyer_landing"; login: string; password: string; starts_at: string | null; expires_at: string | null }) =>
    call("admin_grant_access", p),
  adminListAccess: () => call("admin_list_access"),
  adminRevokeAccess: (id: number) => call("admin_revoke_access", { id }),
  requestAdminSms: (phone: string, purpose: "login" | "reset" = "login") =>
    call("admin_request_sms", { phone, purpose }),
  adminSmsStats: (days: number) => call("admin_sms_stats", { days }),
  adminListUsers: () => call("admin_list_users"),
  adminListTickets: () => call("admin_list_tickets"),
  adminTemplateBriefs: () => call("admin_template_briefs"),
  adminPromoSlots: () => call("admin_promo_slots"),
  adminAnswerTicket: (id: number, answer: string) => call("admin_answer_ticket", { id, answer }),
  supportCreate: (message: string, name?: string, phone?: string, email?: string, topic?: string) =>
    call("support_create", { message, name, phone, email, topic }),
  getMaintenance: () => call("get_maintenance"),
  adminSetMaintenance: (enabled: boolean) => call("admin_set_maintenance", { enabled }),
  logout: () => call("logout"),
};