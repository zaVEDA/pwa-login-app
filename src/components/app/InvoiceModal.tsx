import { useInvoiceModal } from "./invoice/useInvoiceModal";
import InvoiceMinimizedBar from "./invoice/InvoiceMinimizedBar";
import InvoiceModalBody from "./invoice/InvoiceModalBody";
import { PlanType } from "@/lib/auth";

interface Props {
  onClose: () => void;
  phone: string;
  onSaved?: () => void;
  invoiceId?: number | null;
  userPlan?: PlanType | null;
}

export default function InvoiceModal({ onClose, phone, onSaved, invoiceId, userPlan }: Props) {
  const m = useInvoiceModal({ phone, onSaved, invoiceId });

  if (m.minimized) {
    return (
      <InvoiceMinimizedBar
        invoiceNumber={m.invoiceNumber}
        total={m.total}
        onExpand={() => m.setMinimized(false)}
        onClose={onClose}
      />
    );
  }

  return <InvoiceModalBody m={m} onClose={onClose} userPlan={userPlan} />;
}
