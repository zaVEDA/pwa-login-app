import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { knowledgeApi, KnowledgeArticle, ArticleDraft, emptyArticle } from "@/lib/knowledge";

const inputCls =
  "w-full text-sm rounded-xl border border-border bg-white/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-foreground/80">{label}</p>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
  saving,
  error,
}: {
  draft: ArticleDraft;
  setDraft: (d: ArticleDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
}) {
  const set = (patch: Partial<ArticleDraft>) => setDraft({ ...draft, ...patch });

  return (
    <div className="card-warm rounded-2xl p-4 shadow-sm space-y-3">
      <p className="text-sm font-semibold">{draft.id ? "Редактируем статью" : "Новая статья"}</p>

      <Field label="Заголовок">
        <input
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Например: Как оформить самозанятость"
          className={inputCls}
        />
      </Field>

      <Field label="Короткое описание" hint="Показывается в списке под заголовком">
        <textarea
          value={draft.summary}
          onChange={(e) => set({ summary: e.target.value })}
          rows={2}
          placeholder="О чём материал в одном предложении"
          className={inputCls + " resize-none"}
        />
      </Field>

      <Field
        label="Ссылка на видео"
        hint="Вставьте ссылку с VK Видео или RuTube — плеер соберётся сам. Можно оставить пустым."
      >
        <input
          value={draft.video_url}
          onChange={(e) => set({ video_url: e.target.value })}
          placeholder="https://rutube.ru/video/... или https://vk.com/video-123_456"
          className={inputCls}
        />
      </Field>

      <Field label="Текст под видео" hint="Расшифровка, шаги, важные ссылки. Абзацы сохраняются.">
        <textarea
          value={draft.body}
          onChange={(e) => set({ body: e.target.value })}
          rows={7}
          placeholder="Пошагово: что делать, куда нажать, на что обратить внимание…"
          className={inputCls + " resize-y"}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Для кого" hint="Психолог, Няня, Универсальное…">
          <input
            value={draft.category}
            onChange={(e) => set({ category: e.target.value })}
            placeholder="Универсальное"
            className={inputCls}
          />
        </Field>
        <Field label="Время просмотра">
          <input
            value={draft.read_time}
            onChange={(e) => set({ read_time: e.target.value })}
            placeholder="5 мин"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Иконка" hint="Название из набора, напр. BookOpen">
          <input
            value={draft.icon}
            onChange={(e) => set({ icon: e.target.value })}
            placeholder="BookOpen"
            className={inputCls}
          />
        </Field>
        <Field label="Порядок" hint="Больше число — выше в списке">
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => set({ sort_order: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => set({ featured: !draft.featured })}
          className={`text-xs px-3 py-2 rounded-xl font-medium border flex items-center gap-1.5 ${
            draft.featured
              ? "gold-gradient text-white border-transparent"
              : "bg-white/60 text-muted-foreground border-border"
          }`}
        >
          <Icon name="Star" size={12} /> Рекомендуем
        </button>
        <button
          onClick={() => set({ published: !draft.published })}
          className={`text-xs px-3 py-2 rounded-xl font-medium border flex items-center gap-1.5 ${
            draft.published
              ? "bg-emerald-100 text-emerald-700 border-transparent"
              : "bg-white/60 text-muted-foreground border-border"
          }`}
        >
          <Icon name={draft.published ? "Eye" : "EyeOff"} size={12} />
          {draft.published ? "Видна всем" : "Черновик"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!draft.title.trim() || saving}
          className="flex-1 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl bg-white/60 border border-border text-sm text-muted-foreground"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default function KnowledgeManager() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    knowledgeApi
      .listAll()
      .then((r) => setArticles(r.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const res = draft.id ? await knowledgeApi.update(draft) : await knowledgeApi.create(draft);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDraft(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    await knowledgeApi.remove(id);
  };

  if (draft) {
    return (
      <Editor
        draft={draft}
        setDraft={setDraft}
        onSave={save}
        onCancel={() => setDraft(null)}
        saving={saving}
        error={error}
      />
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setDraft({ ...emptyArticle })}
        className="w-full py-2.5 rounded-xl gold-gradient text-white text-sm font-medium flex items-center justify-center gap-1.5"
      >
        <Icon name="Plus" size={14} /> Добавить материал
      </button>

      {loading ? (
        <div className="flex justify-center py-8">
          <Icon name="Loader" size={22} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {articles.map((a) => (
            <div key={a.id} className="card-warm rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  {a.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.summary}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    {a.category && (
                      <span className="doc-tag bg-primary/10 text-primary text-[10px]">{a.category}</span>
                    )}
                    {a.featured && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Icon name="Star" size={11} /> Рекомендуем
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon name={a.video_url ? "Video" : "FileText"} size={11} />
                      {a.video_url ? "с видео" : "только текст"}
                    </span>
                    {!a.published && (
                      <span className="flex items-center gap-1">
                        <Icon name="EyeOff" size={11} /> черновик
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setDraft({ ...a })}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-white/60 border border-border text-muted-foreground flex items-center gap-1"
                  >
                    <Icon name="Pencil" size={11} /> Изменить
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-white/60 border border-red-200 text-red-500 flex items-center gap-1"
                  >
                    <Icon name="Trash2" size={11} /> Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">Пока нет материалов</p>
          )}
        </div>
      )}
    </div>
  );
}
