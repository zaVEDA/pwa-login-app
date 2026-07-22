import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const DOCS = [
  { key: "drafts", title: "Юридические документы (черновики)", md: "/legal-drafts.md", doc: "/legal-drafts.doc" },
  { key: "explained", title: "Пояснительная записка", md: "/legal-explained.md", doc: "/legal-explained.doc" },
];

function renderMd(md: string) {
  const lines = md.split("\n");
  const out: JSX.Element[] = [];
  let key = 0;
  let table: string[][] | null = null;

  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    out.push(
      <div key={key++} className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i} className="border border-border bg-muted px-2 py-1.5 text-left font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} className="border border-border px-2 py-1.5 align-top">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    table = null;
  };

  const inline = (s: string) =>
    s.replace(/\*\*(.*?)\*\*/g, "$1");

  for (const raw of lines) {
    const ln = raw.trimEnd();
    if (ln.trim().startsWith("|")) {
      const cells = ln.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (cells.every((c) => /^[-: ]*$/.test(c))) continue;
      (table ??= []).push(cells);
      continue;
    } else flushTable();

    if (ln.startsWith("> ")) {
      out.push(<p key={key++} className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3 my-1.5">{inline(ln.slice(2))}</p>);
    } else if (ln.trim() === "---") {
      out.push(<hr key={key++} className="my-5 border-border" />);
    } else if (ln.startsWith("### ")) {
      out.push(<h3 key={key++} className="text-base font-semibold mt-4 mb-1.5">{inline(ln.slice(4))}</h3>);
    } else if (ln.startsWith("## ")) {
      out.push(<h2 key={key++} className="text-lg font-bold mt-5 mb-2 text-primary">{inline(ln.slice(3))}</h2>);
    } else if (ln.startsWith("# ")) {
      out.push(<h1 key={key++} className="text-xl font-bold mt-6 mb-2">{inline(ln.slice(2))}</h1>);
    } else if (ln.trim().startsWith("- ")) {
      out.push(<li key={key++} className="text-sm ml-5 list-disc my-0.5">{inline(ln.trim().slice(2))}</li>);
    } else if (ln.trim()) {
      out.push(<p key={key++} className="text-sm my-1.5 leading-relaxed">{inline(ln)}</p>);
    }
  }
  flushTable();
  return out;
}

export default function Legal() {
  const [active, setActive] = useState(DOCS[0]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(active.md)
      .then((r) => r.text())
      .then((t) => { setContent(t); setLoading(false); })
      .catch(() => { setContent("Не удалось загрузить документ."); setLoading(false); });
  }, [active]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="ScrollText" size={22} className="text-primary" />
          <h1 className="text-xl font-bold">Юридические документы</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Черновики для проверки юристом. На сайте пока не опубликованы. Можно читать здесь или скачать в Word.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {DOCS.map((d) => (
            <button
              key={d.key}
              onClick={() => setActive(d)}
              className={`text-xs px-3 py-2 rounded-xl font-medium border ${
                active.key === d.key ? "bg-primary text-primary-foreground border-transparent" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <a href={active.doc} download className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium bg-card border border-border hover:border-primary">
            <Icon name="Download" size={14} className="text-primary" /> Скачать этот документ (Word)
          </a>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          {loading ? (
            <div className="flex justify-center py-10"><Icon name="Loader" size={22} className="animate-spin text-primary" /></div>
          ) : (
            <div className="prose-none">{renderMd(content)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
