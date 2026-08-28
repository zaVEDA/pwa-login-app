import { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface RevealItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function RevealItem({ children, delay = 0, className = "" }: RevealItemProps) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
