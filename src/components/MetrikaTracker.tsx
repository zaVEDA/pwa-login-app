import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { COUNTER_ID } from "@/lib/metrika";

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export default function MetrikaTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.ym === "function") {
      window.ym(COUNTER_ID, "hit", location.pathname + location.search);
    }
  }, [location.pathname, location.search]);

  return null;
}