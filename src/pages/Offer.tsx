import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

function renderMd(md: string) {
  const lines = md.split("\n");
  const out: JSX.Element[] = [];
  let key = 0;

  const inline = (s: string) => s.replace(/\*\*(.*?)\*\*/g, "$1");

  for (const raw of lines) {
    const ln = raw.trimEnd();
    if (ln.startsWith("> ")) {
      out.push(
        <p key={key++} className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3 my-3">
          {inline(ln.slice(2))}
        </p>
      );
    } else if (ln.trim() === "---") {
      out.push(<hr key={key++} className="my-5 border-border" />);
    } else if (ln.startsWith("### ")) {
      out.push(
        <h3 key={key++} className="text-base font-semibold mt-5 mb-1.5 text-foreground">
          {inline(ln.slice(4))}
        </h3>
      );
    } else if (ln.startsWith("## ")) {
      out.push(
        <h2 key={key++} className="font-cormorant text-xl font-bold mt-7 mb-2 text-primary">
          {inline(ln.slice(3))}
        </h2>
      );
    } else if (ln.startsWith("# ")) {
      out.push(
        <h1 key={key++} className="font-cormorant text-2xl sm:text-3xl font-bold mt-2 mb-3 text-foreground">
          {inline(ln.slice(2))}
        </h1>
      );
    } else if (ln.trim()) {
      out.push(
        <p key={key++} className="text-sm my-2 leading-relaxed text-muted-foreground">
          {inline(ln)}
        </p>
      );
    }
  }
  return out;
}

export default function Offer() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/offer.md")
      .then((r) => r.text())
      .then((t) => {
        setContent(t);
        setLoading(false);
      })
      .catch(() => {
        setContent("Не удалось загрузить документ.");
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icon name="ArrowLeft" size={16} /> На главную
          </a>
          <a
            href="/offer.pdf"
            download="Оферта-Заведующая.pdf"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg, hsl(35 72% 48%), hsl(32 75% 40%))" }}
          >
            <Icon name="Download" size={16} /> Скачать PDF
          </a>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-10 justify-center">
              <Icon name="Loader2" size={18} className="animate-spin" /> Загрузка…
            </div>
          ) : (
            <article>{renderMd(content)}</article>
          )}
        </div>

        <footer className="text-center py-8">
          <p className="text-xs text-muted-foreground">
            ООО «ЗАВЕДУЮЩАЯ» · ИНН 3801165360 · ОГРН 1253800010320
          </p>
          <p className="text-xs text-muted-foreground">e-mail: capydoc@mail.ru · тел.: +7 901 662-57-52</p>
        </footer>
      </div>
    </div>
  );
}