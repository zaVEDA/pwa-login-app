declare global {
  interface Window {
    ym?: (counterId: number, action: string, goal: string, params?: Record<string, unknown>) => void;
  }
}

const COUNTER_ID = 101026698;

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  try {
    if (typeof window.ym === "function") {
      window.ym(COUNTER_ID, "reachGoal", goal, params);
    }
  } catch {
    // метрика не должна ломать интерфейс
  }
}
