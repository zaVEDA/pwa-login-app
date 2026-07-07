import Icon from "@/components/ui/icon";

const benefits = [
  {
    icon: "FileSignature",
    title: "Документ за 2 минуты",
    desc: "Готовые шаблоны договоров, чеков и согласий под вашу специальность — просто заполните поля",
  },
  {
    icon: "Fingerprint",
    title: "Подпись по СМС",
    desc: "Клиент подписывает документ с телефона по СМС-коду — юридически значимо, без личной встречи",
  },
  {
    icon: "ShieldCheck",
    title: "Спокойствие при проверках",
    desc: "Все документы оформлены по закону — не переживайте за проверки банком, налоговой и споры с клиентами",
  },
  {
    icon: "BookOpen",
    title: "База знаний",
    desc: "Понятные разборы: что должно быть в договоре, как считать налоги, как оформить самозанятость",
  },
  {
    icon: "FolderOpen",
    title: "Всё в одном месте",
    desc: "История документов и клиентов хранится в приложении — не потеряется и не запутается",
  },
  {
    icon: "Smartphone",
    title: "Прямо с телефона",
    desc: "Работает как приложение — оформляйте документы между встречами, без ноутбука и принтера",
  },
];

const image = "https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/9bffd4e1-83c6-44fb-8bfe-0ed3f286b8c2.jpg";

export default function WelcomeBenefits() {
  return (
    <section className="px-5 py-14 max-w-3xl mx-auto">
      <div className="rounded-3xl overflow-hidden mb-10 shadow-sm">
        <img src={image} alt="Оформление документа с электронной подписью" className="w-full h-56 object-cover" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Почему выбирают нас</p>
      <h2 className="font-cormorant text-3xl font-semibold mb-10 text-center" style={{ color: "hsl(24 20% 13%)" }}>
        Всё для законной работы — в одном приложении
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {benefits.map((b) => (
          <div key={b.title} className="p-5 rounded-2xl border bg-white/60"
            style={{ borderColor: "hsl(36 28% 82%)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "hsl(35 72% 48% / 0.12)" }}>
              <Icon name={b.icon} size={20} style={{ color: "hsl(35 72% 42%)" }} />
            </div>
            <h3 className="font-semibold text-sm mb-1.5">{b.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}