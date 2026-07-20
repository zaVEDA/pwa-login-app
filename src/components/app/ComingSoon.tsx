export default function ComingSoon() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}
    >
      <div className="max-w-sm w-full">
        <img
          src="https://cdn.poehali.dev/projects/213d0799-3b2e-46b3-b3d9-f3cb0a984b4f/files/9dc17077-0d3c-4b1c-bf93-e76dfa47fc71.jpg"
          alt="Готовимся к запуску"
          className="w-56 h-56 mx-auto rounded-3xl object-cover shadow-xl mb-8"
        />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Активная разработка
        </div>
        <h1 className="font-cormorant text-3xl font-semibold text-foreground mb-3 leading-tight">
          Приложение в активной разработке
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Готовимся к запуску. Совсем скоро здесь будет удобный сервис документов для вашего дела.
        </p>
      </div>
    </div>
  );
}
