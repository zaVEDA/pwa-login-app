export const COUNTER_ID = 111819609;

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  try {
    if (typeof window.ym === "function") {
      window.ym(COUNTER_ID, "reachGoal", goal, params);
    }
  } catch {
    // метрика не должна ломать интерфейс
  }
}