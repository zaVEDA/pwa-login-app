import { useState, useEffect, useCallback } from "react";

export const BRIEF_URL = "https://functions.poehali.dev/b9cceef8-d56c-4b6d-9fbb-85f2732e8839";

export interface SlotStatus {
  has_slot: boolean;
  slot_number: number | null;
  brief_sent: boolean;
}

export async function fetchSlotStatus(): Promise<SlotStatus | null> {
  try {
    const res = await fetch(BRIEF_URL, {
      headers: { "X-Auth-Token": localStorage.getItem("authToken") || "" },
    });
    if (!res.ok) return null;
    const d = await res.json();
    return { has_slot: !!d.has_slot, slot_number: d.slot_number ?? null, brief_sent: !!d.brief_sent };
  } catch {
    return null;
  }
}

/** Место по акции «12 шаблонов»: есть ли оно и отправлена ли анкета */
export function useTemplateSlot(enabled = true) {
  const [slot, setSlot] = useState<SlotStatus | null>(null);

  const reload = useCallback(() => {
    if (!enabled) return;
    fetchSlotStatus().then(setSlot);
  }, [enabled]);

  useEffect(reload, [reload]);

  return { slot, reload };
}
