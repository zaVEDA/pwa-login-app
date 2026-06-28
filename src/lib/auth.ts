const AUTH_URL = "https://functions.poehali.dev/014fc1d1-8785-4bdb-8c38-bc1b5126ef4b";

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
  requestCode: (p: { purpose: string; channel: string; phone?: string; email?: string }) =>
    call("request_code", p),
  verifyCode: (p: { purpose: string; channel: string; phone?: string; email?: string; code: string }) =>
    call("verify_code", p),
  loginPassword: (p: { login: string; password: string }) => call("login_password", p),
  checkDevice: (phone: string) => call("check_device", { phone }),
  me: () => call("me"),
  updateProfile: (p: { full_name?: string; email?: string; login?: string; password?: string }) =>
    call("update_profile", p),
  resetPassword: (password: string) => call("reset_password", { password }),
  logout: () => call("logout"),
};
