import { getToken } from "./auth";

const NOTIFY_URL = "https://functions.poehali.dev/3e70c3e5-055c-4afb-9e0d-dc2e3e2af679";

export interface NotifySettings {
  sms: boolean;
  email: boolean;
  docs: boolean;
  plan: boolean;
  news: boolean;
}

export interface NotifyItem {
  id: number;
  title: string;
  body: string;
  kind: string;
  is_read: boolean;
  created_at: string;
}

async function call(payload: Record<string, unknown>) {
  const r = await fetch(NOTIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() },
    body: JSON.stringify(payload),
  });
  return { status: r.status, data: await r.json() };
}

export const notifyApi = {
  async list() {
    const r = await fetch(NOTIFY_URL, { headers: { "X-Auth-Token": getToken() } });
    return { status: r.status, data: await r.json() };
  },
  saveSettings(settings: NotifySettings) {
    return call({ action: "save_settings", settings });
  },
  markRead(id?: number) {
    return call({ action: "mark_read", id });
  },
  runPlanReminders(with_sms: boolean) {
    return call({ action: "run_plan_reminders", with_sms });
  },
  adminSend(payload: {
    title: string;
    body: string;
    kind: string;
    with_sms: boolean;
    target: "all" | "plan" | "selected";
    plan?: string;
    user_ids?: number[];
  }) {
    return call({ action: "admin_send", ...payload });
  },
};
