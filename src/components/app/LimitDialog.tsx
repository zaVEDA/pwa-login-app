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
import { DocLimits } from "@/lib/limits";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limits: DocLimits | null;
  onChangePlan: () => void;
  onBuyPack: () => void;
}

export default function LimitDialog({ open, onOpenChange, limits, onChangePlan, onBuyPack }: Props) {
  if (!limits || limits.unlimited || limits.limit === null) return null;

  const remaining = limits.remaining ?? 0;
  const reached = limits.reached;

  const title = reached ? "Лимит документов исчерпан" : `Осталось ${remaining} документов`;
  const desc = reached
    ? "На вашем тарифе закончился месячный лимит документов. Чтобы продолжить, докупите пакет документов или перейдите на тариф с большим лимитом."
    : `В этом месяце по вашему тарифу осталось ${remaining} из ${limits.limit} документов. Когда лимит закончится, можно докупить пакет документов или сменить тариф (тарификация с момента оплаты).`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1 ${reached ? "bg-red-100" : "bg-amber-100"}`}>
            <Icon name={reached ? "OctagonAlert" : "TriangleAlert"} size={22} className={reached ? "text-red-600" : "text-amber-600"} />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>Позже</AlertDialogCancel>
          <button
            onClick={onBuyPack}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-white px-4 py-2 text-sm font-medium text-primary hover:border-primary transition-colors mt-2 sm:mt-0"
          >
            <Icon name="Package" size={15} />
            Докупить пакет
          </button>
          <AlertDialogAction onClick={onChangePlan}>Сменить тариф</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
