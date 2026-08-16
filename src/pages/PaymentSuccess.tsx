import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/app?enter=1"), 6000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <Icon name="CircleCheck" size={44} className="text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Оплата прошла успешно</h1>
          <p className="text-muted-foreground">
            Тариф активирован. Спасибо, что вы с нами!
          </p>
        </div>
        <Button className="w-full" size="lg" onClick={() => navigate("/app?enter=1")}>
          Перейти в кабинет
        </Button>
        <p className="text-xs text-muted-foreground">
          Через несколько секунд вы вернётесь в кабинет автоматически
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
