import { getToken } from "@/lib/auth";

const URL = "https://functions.poehali.dev/c266f5e8-3eeb-4d21-8f9e-76ead826a80a";

export type TaskStatus = "open" | "done" | "postponed" | "irrelevant";

export interface AdminTask {
  id: number;
  created_at: string;
  assignee: "Я" | "Юра";
  status: TaskStatus;
  status_date: string | null;
  comment: string;
}

async function call(body: Record<string, unknown>): Promise<any> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const tasksApi = {
  list: () => call({ action: "list" }) as Promise<{ tasks: AdminTask[] }>,
  add: (comment: string, assignee: "Я" | "Юра") =>
    call({ action: "add", comment, assignee }) as Promise<{ task: AdminTask }>,
  setStatus: (id: number, status: TaskStatus) =>
    call({ action: "set_status", id, status }) as Promise<{ task: AdminTask }>,
  remove: (id: number) => call({ action: "delete", id }) as Promise<{ ok: boolean }>,
};
