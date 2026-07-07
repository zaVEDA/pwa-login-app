import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

export default function WelcomeCta() {
  return (
    <>
      {/* CTA */}
      <section className="px-5 pt-8 pb-12 max-w-3xl mx-auto">
        <div className="rounded-3xl p-6 sm:p-10 relative overflow-hidden text-center"
          style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 40%))" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
          <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold text-white mb-3 relative z-10">
            Готовы навести порядок в своих документах?
          </h2>
          <p className="text-white/80 text-sm mb-6 relative z-10">
            Запуск первой версии приложения — с 15 июля. Заходите и знакомьтесь уже сейчас
          </p>
          <div className="flex justify-center relative z-10">
            <a
              href="/"
              onClick={() => reachGoal("welcome_cta_start")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03]"
              style={{ background: "white", color: "hsl(35 72% 38%)" }}
            >
              <Icon name="Eye" size={16} />
              Зайти и ознакомиться
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 text-center border-t" style={{ borderColor: "hsl(36 28% 82%)" }}>
        <p className="font-cormorant text-lg font-medium mb-1" style={{ color: "hsl(35 72% 42%)" }}>ООО «ЗаВедующая»</p>
        <p className="text-xs text-muted-foreground">Документы и подписи для помогающих специалистов · 2026</p>
      </footer>
    </>
  );
}