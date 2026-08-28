import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  action?: "save" | "send";
  isTrial?: boolean;
}

export default function PdfWarnDialog({ open, onOpenChange, onConfirm, action = "save", isTrial }: Props) {
  const confirmLabel = action === "send" ? "Отправить" : "Сохранить в PDF";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center mb-1">
            <Icon name="TriangleAlert" size={22} className="text-amber-600" />
          </div>
          <AlertDialogTitle>Проверьте данные клиента</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed space-y-2">
            <span className="block">
              Мы не проверяем реквизиты и паспортные данные клиента. Проверьте данные
              самостоятельно — вы несёте ответственность за их корректность.
            </span>
            {isTrial && (
              <span className="flex items-start gap-1.5 text-amber-700 font-medium">
                <Icon name="Stamp" size={14} className="flex-shrink-0 mt-0.5" />
                На тарифе «Тест-драйв» документ будет помечен полупрозрачной голограммой «ТЕСТ» —
                и в отправленной версии, и при сохранении/печати PDF.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}