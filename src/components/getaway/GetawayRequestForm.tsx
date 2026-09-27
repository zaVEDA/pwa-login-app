import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/ui/phone-input";
import { useToast } from "@/hooks/use-toast";

export default function GetawayRequestForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("1");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isPhoneValid = phoneDigits.length === 10;
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isNameValid = name.trim().length >= 2;
  const isGuestsValid = Number(guests) >= 1;
  const canSubmit = isNameValid && isPhoneValid && isEmailValid && isGuestsValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("https://functions.poehali.dev/abf3541c-8c19-454a-a93e-e2de2accb9bc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: `+7${phoneDigits}`,
          email: email.trim(),
          guests,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      setSent(true);
      toast({ title: "Заявка отправлена", description: "Свяжемся с вами в ближайшее время" });
    } catch (err) {
      toast({
        title: "Не удалось отправить",
        description: err instanceof Error ? err.message : "Попробуйте ещё раз",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-3xl border-2 p-8 text-center max-w-lg mx-auto"
        style={{ borderColor: "hsl(140 40% 45% / 0.35)", background: "hsl(140 40% 45% / 0.06)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "hsl(140 40% 45% / 0.15)" }}
        >
          <Icon name="Check" size={28} style={{ color: "hsl(140 40% 32%)" }} />
        </div>
        <h3 className="font-cormorant text-2xl font-bold mb-2" style={{ color: "hsl(24 20% 13%)" }}>
          Заявка отправлена!
        </h3>
        <p className="text-sm text-muted-foreground">
          Спасибо! Мы свяжемся с вами в ближайшее время, чтобы обсудить детали поездки.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 p-6 sm:p-8 max-w-lg mx-auto shadow-sm"
      style={{ borderColor: "hsl(140 30% 55% / 0.35)", background: "white" }}
    >
      <div className="text-center mb-6">
        <h3 className="font-cormorant text-2xl sm:text-3xl font-bold mb-2" style={{ color: "hsl(24 20% 13%)" }}>
          Оставить заявку
        </h3>
        <p className="text-sm text-muted-foreground">
          Заполните форму — свяжемся с вами и ответим на все вопросы
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Имя</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как вас зовут"
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <PhoneInput
            id="phone"
            value={phoneDigits}
            onChange={setPhoneDigits}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={150}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guests">Количество человек</Label>
          <Input
            id="guests"
            type="number"
            min={1}
            max={6}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, hsl(140 40% 42%), hsl(140 40% 32%))", color: "white" }}
        >
          <Icon name={loading ? "Loader2" : "Send"} size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Отправляем..." : "Отправить заявку"}
        </button>
      </div>
    </form>
  );
}