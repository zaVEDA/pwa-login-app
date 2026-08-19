import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { knowledgeApi, KnowledgeArticle } from "@/lib/knowledge";
import ArticleView from "./ArticleView";

export default function KnowledgeTab() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    knowledgeApi
      .list()
      .then((r) => setArticles(r.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const open = articles.find((a) => a.id === openId);
  if (open) return <ArticleView article={open} onBack={() => setOpenId(null)} />;

  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="font-cormorant text-2xl font-semibold mb-1">База знаний</h2>
        <p className="text-xs text-muted-foreground">Законодательство и практика для самозанятых</p>
      </div>

      <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
        <Icon name="Construction" size={14} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs font-semibold text-amber-800">Данный раздел находится в активной разработке</p>
      </div>

      {loading && (
        <div className="card-warm rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">Загружаем материалы…</p>
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="card-warm rounded-2xl p-5 shadow-sm text-center">
          <Icon name="BookOpen" size={22} className="text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Материалы скоро появятся</p>
        </div>
      )}

      {featured && (
        <button
          onClick={() => setOpenId(featured.id)}
          className="card-warm rounded-2xl p-5 shadow-sm w-full text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="doc-tag bg-primary/15 text-primary text-[10px]">Рекомендуем</span>
            {featured.video_url && (
              <span className="doc-tag bg-primary/10 text-primary text-[10px] flex items-center gap-1">
                <Icon name="Play" size={10} /> Видео
              </span>
            )}
          </div>
          <h3 className="font-cormorant text-xl font-semibold text-foreground mb-2">{featured.title}</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{featured.summary}</p>
          <span className="flex items-center gap-2 text-sm font-medium text-primary">
            Смотреть и читать <Icon name="ArrowRight" size={14} />
          </span>
        </button>
      )}

      <div className="space-y-3">
        {rest.map((a) => (
          <button
            key={a.id}
            onClick={() => setOpenId(a.id)}
            className="card-warm rounded-2xl p-4 flex gap-3 items-start w-full text-left shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name={a.video_url ? "Play" : a.icon} fallback="BookOpen" size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{a.title}</p>
              {a.summary && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.summary}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {a.read_time && <p className="text-xs text-primary">{a.read_time} чтения</p>}
                {a.video_url && (
                  <span className="text-[10px] text-primary/80 flex items-center gap-1">
                    <Icon name="Video" size={10} /> с видео
                  </span>
                )}
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}