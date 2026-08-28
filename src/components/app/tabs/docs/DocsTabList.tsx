import Icon from "@/components/ui/icon";
import ContractCard from "./ContractCard";
import InvoiceCard from "./InvoiceCard";
import RealizationDocCard from "./RealizationDocCard";
import { Contract, Invoice, RealizationDoc } from "../constants";
import type { DateRange } from "react-day-picker";
import { PlanType } from "@/lib/auth";

interface Props {
  userPlan?: PlanType | null;
  invoicesLoading: boolean;
  dateRange: DateRange | undefined;
  clientFilter: string;
  docFilter: string;

  showInvoicesList: boolean;
  filteredInvoices: Invoice[];
  showContracts: boolean;
  filteredContracts: Contract[];
  filteredDocs: RealizationDoc[];

  pdfLoadingId: number | null;
  docLoadingId: number | null;
  basisMenuId: number | null;
  setBasisMenuId: (v: number | null) => void;
  basisHelp: boolean;
  setBasisHelp: (fn: (v: boolean) => boolean) => void;
  docTips: Record<string, string>;
  shareMenuId: number | null;
  setShareMenuId: (v: number | null) => void;
  statusMenuId: number | null;
  setStatusMenuId: (v: number | null) => void;
  setOpenInvoiceId: (v: number | null) => void;
  setShowInvoice: (v: boolean) => void;
  downloadPdf: (id: number, invoiceNumber: string) => void;
  createDocument: (inv: Invoice, docType: "act" | "invoice_note") => void;
  shareInvoice: (inv: Invoice, channel: "telegram" | "whatsapp" | "sms" | "email") => void;
  changeStatus: (id: number, status: string) => void;
  deleteInvoice: (id: number) => void;

  contractMenuId: number | null;
  setContractMenuId: (v: number | null) => void;
  setOpenContract: (v: Contract | null) => void;
  changeContractStatus: (id: number, status: string) => void;
  downloadContractPdf: (c: Contract) => void;
  contractPdfId: number | null;
  contractShareId: number | null;
  setContractShareId: (v: number | null) => void;
  shareContract: (c: Contract, channel: "telegram" | "whatsapp" | "sms" | "email", clientPhone?: string) => void;
  onContractSendFlow?: (c: Contract) => void;

  shareDocId: number | null;
  setShareDocId: (v: number | null) => void;
  setOpenDocId: (v: number | null) => void;
  downloadDocPdf: (doc: RealizationDoc) => void;
  printDocPdf: (doc: RealizationDoc) => void;
  changeDocStatus: (id: number, status: string) => void;
  shareDoc: (doc: RealizationDoc, channel: "telegram" | "whatsapp" | "sms" | "email") => void;
}

export default function DocsTabList({
  userPlan,
  invoicesLoading,
  dateRange,
  clientFilter,
  docFilter,
  showInvoicesList,
  filteredInvoices,
  showContracts,
  filteredContracts,
  filteredDocs,
  pdfLoadingId,
  docLoadingId,
  basisMenuId,
  setBasisMenuId,
  basisHelp,
  setBasisHelp,
  docTips,
  shareMenuId,
  setShareMenuId,
  statusMenuId,
  setStatusMenuId,
  setOpenInvoiceId,
  setShowInvoice,
  downloadPdf,
  createDocument,
  shareInvoice,
  changeStatus,
  deleteInvoice,
  contractMenuId,
  setContractMenuId,
  setOpenContract,
  changeContractStatus,
  downloadContractPdf,
  contractPdfId,
  contractShareId,
  setContractShareId,
  shareContract,
  onContractSendFlow,
  shareDocId,
  setShareDocId,
  setOpenDocId,
  downloadDocPdf,
  printDocPdf,
  changeDocStatus,
  shareDoc,
}: Props) {
  return (
    <>
      {invoicesLoading && (
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader" size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!invoicesLoading && (showInvoicesList ? filteredInvoices.length : 0) === 0 && filteredDocs.length === 0 && (showContracts ? filteredContracts.length : 0) === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Icon name="FileText" size={24} className="text-primary/50" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {dateRange?.from || clientFilter
              ? "Ничего не найдено по выбранным фильтрам"
              : docFilter === "Все" ? "Документов пока нет" : `Раздел «${docFilter}» пуст`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {dateRange?.from || clientFilter ? "Попробуйте изменить дату или клиента" : "Нажмите + чтобы создать первый счёт"}
          </p>
        </div>
      )}

      {!invoicesLoading && showContracts && filteredContracts.length > 0 && (
        <div className="space-y-3">
          {filteredContracts.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              menuId={contractMenuId}
              setMenuId={setContractMenuId}
              onOpen={setOpenContract}
              onStatus={changeContractStatus}
              onPdf={downloadContractPdf}
              pdfLoadingId={contractPdfId}
              shareId={contractShareId}
              setShareId={setContractShareId}
              onShare={shareContract}
              onSendFlow={onContractSendFlow}
              userPlan={userPlan}
            />
          ))}
        </div>
      )}

      {!invoicesLoading && showInvoicesList && filteredInvoices.length > 0 && (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              inv={inv}
              pdfLoadingId={pdfLoadingId}
              docLoadingId={docLoadingId}
              basisMenuId={basisMenuId}
              setBasisMenuId={setBasisMenuId}
              basisHelp={basisHelp}
              setBasisHelp={setBasisHelp}
              docTips={docTips}
              shareMenuId={shareMenuId}
              setShareMenuId={setShareMenuId}
              statusMenuId={statusMenuId}
              setStatusMenuId={setStatusMenuId}
              setOpenInvoiceId={setOpenInvoiceId}
              setShowInvoice={setShowInvoice}
              downloadPdf={downloadPdf}
              createDocument={createDocument}
              shareInvoice={shareInvoice}
              changeStatus={changeStatus}
              deleteInvoice={deleteInvoice}
            />
          ))}
        </div>
      )}

      {/* Документы реализации: акты и накладные */}
      {filteredDocs.length > 0 && (
        <div className="space-y-3 pt-2">
          {filteredDocs.map((doc) => (
            <RealizationDocCard
              key={`doc-${doc.id}`}
              doc={doc}
              docLoadingId={docLoadingId}
              statusMenuId={statusMenuId}
              setStatusMenuId={setStatusMenuId}
              shareDocId={shareDocId}
              setShareDocId={setShareDocId}
              setOpenDocId={setOpenDocId}
              downloadDocPdf={downloadDocPdf}
              printDocPdf={printDocPdf}
              changeDocStatus={changeDocStatus}
              shareDoc={shareDoc}
            />
          ))}
        </div>
      )}
    </>
  );
}