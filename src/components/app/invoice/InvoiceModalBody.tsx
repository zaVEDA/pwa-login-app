import Icon from "@/components/ui/icon";
import InvoiceModalHeader from "./InvoiceModalHeader";
import InvoiceClientSection from "./InvoiceClientSection";
import InvoiceItemsSection from "./InvoiceItemsSection";
import InvoiceModalFooter from "./InvoiceModalFooter";
import PdfWarnDialog from "../PdfWarnDialog";
import { PlanType } from "@/lib/auth";
import { useInvoiceModal } from "./useInvoiceModal";

type InvoiceModalState = ReturnType<typeof useInvoiceModal>;

interface Props {
  m: InvoiceModalState;
  onClose: () => void;
  userPlan?: PlanType | null;
}

export default function InvoiceModalBody({ m, onClose, userPlan }: Props) {
  const {
    savedClients,
    showClientList, setShowClientList,
    savedServices,
    showServiceList, setShowServiceList,
    autocompleteIndex, setAutocompleteIndex,
    invoiceNumber, setInvoiceNumber,
    invoiceDate, setInvoiceDate,
    saved,
    editing, setEditing,
    saveLoading,
    saveError,
    pdfLoading,
    showShareSheet, setShowShareSheet,
    pdfWarnOpen, setPdfWarnOpen,
    warnAction,
    setPendingAction,
    pendingAction,
    clientType, setClientType,
    clientInn, setClientInn,
    clientChecking,
    clientError, setClientError,
    clientInfo, setClientInfo,
    items,
    dueDate, setDueDate,
    comment, setComment,
    loadingExisting,
    innMaxLen,
    total,
    readOnly,
    handleSave,
    handleCreatePdf,
    handleShare,
    handleInnCheck,
    addItem,
    removeItem,
    updateItem,
    saveService,
    setMinimized,
  } = m;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
      {/* Фон */}
      <div className="absolute inset-0 bg-background" />

      <div className="relative flex flex-col h-full">
        {loadingExisting && (
          <div className="absolute inset-0 z-20 bg-background/80 flex items-center justify-center">
            <Icon name="Loader" size={24} className="animate-spin text-primary" />
          </div>
        )}
        {/* Header */}
        <InvoiceModalHeader
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          saved={saved}
          readOnly={readOnly}
          onEdit={() => setEditing(true)}
          setInvoiceNumber={setInvoiceNumber}
          setInvoiceDate={setInvoiceDate}
          setMinimized={setMinimized}
          onClose={onClose}
        />

        {/* Scroll content */}
        <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 ${saved ? "pb-56" : "pb-40"}`}>

          {/* Клиент */}
          <InvoiceClientSection
            clientType={clientType}
            clientInn={clientInn}
            clientChecking={clientChecking}
            clientError={clientError}
            clientInfo={clientInfo}
            savedClients={savedClients}
            showClientList={showClientList}
            innMaxLen={innMaxLen}
            readOnly={readOnly}
            setClientType={setClientType}
            setClientInn={setClientInn}
            setClientInfo={setClientInfo}
            setClientError={setClientError}
            setShowClientList={setShowClientList}
            handleInnCheck={handleInnCheck}
          />

          {/* Услуги / срок оплаты / комментарий */}
          <InvoiceItemsSection
            items={items}
            savedServices={savedServices}
            showServiceList={showServiceList}
            autocompleteIndex={autocompleteIndex}
            dueDate={dueDate}
            comment={comment}
            readOnly={readOnly}
            setShowServiceList={setShowServiceList}
            setAutocompleteIndex={setAutocompleteIndex}
            setDueDate={setDueDate}
            setComment={setComment}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            saveService={saveService}
          />
        </div>

        {/* Share sheet + Footer */}
        <InvoiceModalFooter
          total={total}
          saved={saved}
          editing={editing}
          readOnly={readOnly}
          saveLoading={saveLoading}
          saveError={saveError}
          pdfLoading={pdfLoading}
          invoiceNumber={invoiceNumber}
          showShareSheet={showShareSheet}
          setShowShareSheet={setShowShareSheet}
          handleSave={handleSave}
          handleCreatePdf={handleCreatePdf}
          handleShare={handleShare}
          noPlan={!userPlan}
        />
      </div>

      <PdfWarnDialog
        open={pdfWarnOpen}
        onOpenChange={(o) => { setPdfWarnOpen(o); if (!o) setPendingAction(null); }}
        onConfirm={() => { pendingAction?.(); setPendingAction(null); }}
        action={warnAction}
      />
    </div>
  );
}