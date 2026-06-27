import { useState } from "react";
import Icon from "@/components/ui/icon";

type Phrase = {
  id: number;
  text: string;
  active: boolean;
};

const initialPhrases: Phrase[] = [
  { id: 1, text: "Сегодня лучший день, чтобы сделать первый шаг.", active: true },
  { id: 2, text: "Каждый подписанный договор — это уважение к себе и клиенту.", active: true },
  { id: 3, text: "Профессионал отличается не талантом, а порядком в делах.", active: true },
  { id: 4, text: "Один правильно оформленный документ защищает лучше любых слов.", active: true },
  { id: 5, text: "Ваше время стоит дорого — цените его в договоре.", active: true },
  { id: 6, text: "Прозрачность в работе — основа доверия клиента.", active: true },
  { id: 7, text: "Сегодня хороший день, чтобы навести порядок в документах.", active: true },
  { id: 8, text: "Ваша экспертиза заслуживает официального оформления.", active: true },
  { id: 9, text: "Чёткие условия — меньше недопонимания, больше результата.", active: true },
  { id: 10, text: "Каждый новый клиент — новая возможность сделать всё правильно.", active: true },
];

export default function AdminPhrases() {
  const [phrases, setPhrases] = useState<Phrase[]>(initialPhrases);
  const [editingPhrase, setEditingPhrase] = useState<Phrase | null>(null);
  const [showNewPhrase, setShowNewPhrase] = useState(false);
  const [newPhrase, setNewPhrase] = useState("");

  const deletePhrase = (id: number) => setPhrases(phrases.filter(p => p.id !== id));
  const togglePhrase = (id: number) => setPhrases(phrases.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const savePhrase = () => {
    if (!newPhrase.trim()) return;
    setPhrases([...phrases, { id: Date.now(), text: newPhrase.trim(), active: true }]);
    setNewPhrase("");
    setShowNewPhrase(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{phrases.length} фраз · {phrases.filter(p => p.active).length} активных</p>
        <button onClick={() => setShowNewPhrase(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gold-gradient text-white text-sm font-medium shadow-sm">
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {showNewPhrase && (
        <div className="card-warm rounded-2xl p-4 border-2 border-primary/20 space-y-3">
          <p className="font-cormorant text-lg font-semibold">Новая фраза</p>
          <textarea
            placeholder="Введите мотивирующую фразу..."
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-white/70 text-sm outline-none focus:border-primary resize-none"
          />
          <div className="flex gap-2">
            <button onClick={savePhrase} className="flex-1 py-2.5 rounded-xl gold-gradient text-white text-sm font-medium">Сохранить</button>
            <button onClick={() => setShowNewPhrase(false)} className="px-4 py-2.5 rounded-xl border border-border bg-white/60 text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {phrases.map((p, i) => (
          <div key={p.id} className={`card-warm rounded-2xl p-4 transition-opacity ${!p.active ? "opacity-50" : ""}`}>
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-amber-700/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-amber-700">{i + 1}</span>
              </div>
              {editingPhrase?.id === p.id ? (
                <div className="flex-1 space-y-2">
                  <textarea value={editingPhrase.text} rows={2}
                    onChange={(e) => setEditingPhrase({ ...editingPhrase, text: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setPhrases(phrases.map(ph => ph.id === editingPhrase.id ? editingPhrase : ph)); setEditingPhrase(null); }}
                      className="px-3 py-1 rounded-lg gold-gradient text-white text-xs">Сохранить</button>
                    <button onClick={() => setEditingPhrase(null)} className="px-3 py-1 rounded-lg border border-border text-xs">Отмена</button>
                  </div>
                </div>
              ) : (
                <p className="flex-1 text-sm font-cormorant font-medium italic leading-snug">«{p.text}»</p>
              )}
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => togglePhrase(p.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  <Icon name={p.active ? "Eye" : "EyeOff"} size={12} />
                </button>
                <button onClick={() => setEditingPhrase(p)}
                  className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                  <Icon name="Pencil" size={12} />
                </button>
                <button onClick={() => deletePhrase(p.id)}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Icon name="Trash2" size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
