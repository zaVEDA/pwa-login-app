export const INVOICES_URL = "https://functions.poehali.dev/b8539077-8a35-46ed-b604-3f9b439fafa1";
export const HELP_URL = "https://functions.poehali.dev/66109594-95d9-45ec-bcda-4de385abc5ef";

export interface HelpTip { key: string; title: string; body: string; category: string; }

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  client_name: string;
  total: number | null;
  status: string;
}

export interface RealizationDoc {
  id: number;
  doc_type: string;
  doc_number: string;
  doc_date: string;
  invoice_number: string;
  client_name: string;
  total: number | null;
  status: string;
}

export type Tab = "home" | "docs" | "templates" | "knowledge" | "account";

export const recentDocs = [
  { title: "Договор об оказании услуг", client: "Анна М.", date: "09.06.2026", status: "signed", statusLabel: "Подписан" },
  { title: "Акт выполненных работ", client: "Игорь С.", date: "07.06.2026", status: "pending", statusLabel: "Ожидает" },
  { title: "Счёт на оплату", client: "Мария В.", date: "05.06.2026", status: "draft", statusLabel: "Черновик" },
];

export const templates = [
  { icon: "Camera", title: "Соглашение на фото и видео съемку", desc: "Для того чтобы разместить у себя на страничке портфолио работ, или рилс/шортс после проведенной сессии, мероприятия — нужно получить официальное согласие того человека, чьи фото или видео материалы вы используете", tag: "Фотограф" },
  { icon: "FileText", title: "Договор услуг", desc: "Базовый договор с клиентом", tag: "Универсальный" },
  { icon: "Receipt", title: "Акт выполненных работ", desc: "Закрывающий документ", tag: "Универсальный" },
  { icon: "CreditCard", title: "Счёт на оплату", desc: "Выставить счёт клиенту", tag: "Финансы" },
  { icon: "Shield", title: "Соглашение о конфиденциальности", desc: "NDA для сессий", tag: "Психолог" },
  { icon: "Calendar", title: "Абонемент на занятия", desc: "Пакет сессий или уроков", tag: "Репетитор" },
  { icon: "Image", title: "Договор фотосъёмки", desc: "Права на фото и сроки", tag: "Фотограф" },
];

export const specialties = [
  { emoji: "🧠", label: "Психолог" },
  { emoji: "✨", label: "Астролог" },
  { emoji: "🔢", label: "Нумеролог" },
  { emoji: "🎯", label: "Коуч" },
  { emoji: "📚", label: "Репетитор" },
  { emoji: "👶", label: "Няня" },
  { emoji: "📸", label: "Фотограф" },
];

export const themes = {
  honey: { label: "Янтарь", phraseIcon: "Leaf",     dot: "#C8821A" },
  sage:  { label: "Шалфей", phraseIcon: "Sprout",   dot: "#4A9067" },
  rose:  { label: "Роза",   phraseIcon: "Flower2",  dot: "#C0486A" },
  clay:  { label: "Глина",  phraseIcon: "TreePine", dot: "#A0602A" },
} as const;