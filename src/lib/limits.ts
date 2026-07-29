import { INVOICES_URL } from "@/components/app/tabs/constants";

export interface DocLimits {
  plan: string | null;
  limit: number | null;
  used: number;
  remaining: number | null;
  unlimited: boolean;
  reached: boolean;
  period_start: string;
  period_end: string;
}

export async function fetchDocLimits(phone: string): Promise<DocLimits | null> {
  if (!phone) return null;
  try {
    const res = await fetch(`${INVOICES_URL}?limits=1`, { headers: { "X-Phone": phone } });
    const raw = await res.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (data && typeof data.used === "number") return data as DocLimits;
    return null;
  } catch {
    return null;
  }
}
