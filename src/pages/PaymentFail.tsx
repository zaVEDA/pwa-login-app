import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const PaymentFail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <Icon name="CircleX" size={44} className="text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Оплата не прошла</h1>
          <p className="text-muted-foreground">
            Деньги не списаны. Попробуйте оплатить ещё раз или используйте другую карту.
          </p>
        </div>
        <div className="space-y-2">
          <Button className="w-full" size="lg" onClick={() => navigate("/app?enter=1")}>
            Вернуться в кабинет
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/app?enter=1&plans=1")}
          >
            Выбрать тариф заново
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
