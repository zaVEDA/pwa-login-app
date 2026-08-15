import InvoiceModal from "@/components/app/InvoiceModal";
import DocumentModal from "@/components/app/DocumentModal";
import TemplateFillModal from "@/components/app/templates/TemplateFillModal";
import { templateDocs } from "@/components/app/templates/docs";
import PdfWarnDialog from "@/components/app/PdfWarnDialog";
import { Contract } from "../constants";
import { PlanType } from "@/lib/auth";

interface Props {
  phone: string;
  userPlan?: PlanType | null;
  userEmail?: string | null;
  onDocCreated?: () => void;
  onGoToAccount?: () => void;

  showInvoice: boolean;
  setShowInvoice: (v: boolean) => void;
  openInvoiceId: number | null;
  setOpenInvoiceId: (v: number | null) => void;
  loadInvoices: () => void;

  openContract: Contract | null;
  setOpenContract: (v: Contract | null) => void;
  loadContracts: () => void;

  newAgreementDoc: string | null;
  setNewAgreementDoc: (v: string | null) => void;

  openDocId: number | null;
  setOpenDocId: (v: number | null) => void;
  loadDocuments: () => void;

  pdfWarnOpen: boolean;
  setPdfWarnOpen: (v: boolean) => void;
  pendingPdf: (() => void) | null;
  setPendingPdf: (v: (() => void) | null) => void;
  warnAction: "save" | "send";
}

export default function DocsTabModals({
  phone,
  userPlan,
  userEmail,
  onDocCreated,
  onGoToAccount,
  showInvoice,
  setShowInvoice,
  openInvoiceId,
  setOpenInvoiceId,
  loadInvoices,
  openContract,
  setOpenContract,
  loadContracts,
  newAgreementDoc,
  setNewAgreementDoc,
  openDocId,
  setOpenDocId,
  loadDocuments,
  pdfWarnOpen,
  setPdfWarnOpen,
  pendingPdf,
  setPendingPdf,
  warnAction,
}: Props) {
  return (
    <>
      {showInvoice && (
        <InvoiceModal
          onClose={() => { setShowInvoice(false); setOpenInvoiceId(null); }}
          phone={phone}
          onSaved={() => { loadInvoices(); onDocCreated?.(); }}
          invoiceId={openInvoiceId}
          userPlan={userPlan}
        />
      )}
      {openContract && templateDocs[openContract.template_key] && (
        <TemplateFillModal
          doc={templateDocs[openContract.template_key]}
          phone={phone}
          userProfile={{ phone, email: userEmail }}
          contract={openContract}
          onClose={() => setOpenContract(null)}
          onSaved={loadContracts}
          onGoToAccount={() => { setOpenContract(null); onGoToAccount?.(); }}
        />
      )}
      {newAgreementDoc && templateDocs[newAgreementDoc] && (
        <TemplateFillModal
          doc={templateDocs[newAgreementDoc]}
          phone={phone}
          userProfile={{ phone, email: userEmail }}
          onClose={() => setNewAgreementDoc(null)}
          onSaved={loadContracts}
          onGoToAccount={() => { setNewAgreementDoc(null); onGoToAccount?.(); }}
        />
      )}
      {openDocId && (
        <DocumentModal
          docId={openDocId}
          phone={phone}
          onClose={() => setOpenDocId(null)}
          onSaved={loadDocuments}
          userPlan={userPlan}
        />
      )}

      <PdfWarnDialog
        open={pdfWarnOpen}
        onOpenChange={(o) => { setPdfWarnOpen(o); if (!o) setPendingPdf(null); }}
        onConfirm={() => { pendingPdf?.(); setPendingPdf(null); }}
        action={warnAction}
      />
    </>
  );
}
