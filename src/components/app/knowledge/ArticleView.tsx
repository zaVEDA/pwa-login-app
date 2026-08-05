import Icon from "@/components/ui/icon";
import { KnowledgeArticle } from "@/lib/knowledge";

interface Props {
  article: KnowledgeArticle;
  onBack: () => void;
}

export default function ArticleView({ article, onBack }: Props) {
  return (
    <div className="space-y-4 animate-slide-up pb-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon name="ArrowLeft" size={14} /> Назад
      </button>

      <div>
        {article.category && (
          <span className="doc-tag bg-primary/15 text-primary text-[10px] mb-2 inline-block">
            {article.category}
          </span>
        )}
        <h2 className="font-cormorant text-2xl font-semibold leading-tight">{article.title}</h2>
        {article.summary && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{article.summary}</p>
        )}
        {article.read_time && (
          <p className="text-xs text-primary mt-1.5">{article.read_time} чтения</p>
        )}
      </div>

      {article.video_url && (
        <div className="rounded-2xl overflow-hidden border shadow-sm bg-black/5" style={{ borderColor: "hsl(36 28% 82%)" }}>
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={article.video_url}
              title={article.title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;"
              allowFullScreen
              frameBorder="0"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {article.body ? (
        <div className="card-warm rounded-2xl p-5 shadow-sm">
          <div className="text-sm leading-relaxed space-y-3 whitespace-pre-line text-foreground/90">
            {article.body}
          </div>
        </div>
      ) : (
        <div className="card-warm rounded-2xl p-5 shadow-sm text-center">
          <Icon name="Clock" size={22} className="text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Материал скоро появится</p>
        </div>
      )}
    </div>
  );
}
