export type User = {
  id: number;
  name: string;
  phone: string;
  status: "self_employed" | "ip" | "ooo" | "individual" | null;
  specialty: string;
  registeredAt: string;
  lastLoginAt: string;
  loginCount: number;
  paidAt: string | null;
  paymentAmount: number | null;
  docsTotal: number;
  docsSigned: number;
  tabVisits: { home: number; docs: number; templates: number; knowledge: number; account: number };
  avgSessionMin: number;
  dropTab: string | null;
};

export const mockUsers: User[] = [
  { id: 1, name: "Анна Смирнова", phone: "+7 916 000-00-01", status: "self_employed", specialty: "Психолог", registeredAt: "01.05.2024", lastLoginAt: "10.06.2024", loginCount: 34, paidAt: "05.05.2024", paymentAmount: 990, docsTotal: 12, docsSigned: 9, tabVisits: { home: 34, docs: 28, templates: 15, knowledge: 8, account: 5 }, avgSessionMin: 7, dropTab: null },
  { id: 2, name: "Игорь Петров", phone: "+7 903 111-22-33", status: "ip", specialty: "Коуч", registeredAt: "12.05.2024", lastLoginAt: "09.06.2024", loginCount: 18, paidAt: "15.05.2024", paymentAmount: 990, docsTotal: 7, docsSigned: 5, tabVisits: { home: 18, docs: 14, templates: 9, knowledge: 12, account: 3 }, avgSessionMin: 5, dropTab: null },
  { id: 3, name: "Мария Волкова", phone: "+7 926 222-33-44", status: "self_employed", specialty: "Астролог", registeredAt: "20.05.2024", lastLoginAt: "08.06.2024", loginCount: 9, paidAt: null, paymentAmount: null, docsTotal: 3, docsSigned: 1, tabVisits: { home: 9, docs: 4, templates: 7, knowledge: 3, account: 1 }, avgSessionMin: 3, dropTab: "templates" },
  { id: 4, name: "Дмитрий Козлов", phone: "+7 999 333-44-55", status: "ooo", specialty: "Фотограф", registeredAt: "25.05.2024", lastLoginAt: "07.06.2024", loginCount: 22, paidAt: "28.05.2024", paymentAmount: 1990, docsTotal: 15, docsSigned: 13, tabVisits: { home: 22, docs: 20, templates: 11, knowledge: 4, account: 7 }, avgSessionMin: 9, dropTab: null },
  { id: 5, name: "Елена Фролова", phone: "+7 912 444-55-66", status: "individual", specialty: "Няня", registeredAt: "01.06.2024", lastLoginAt: "06.06.2024", loginCount: 4, paidAt: null, paymentAmount: null, docsTotal: 1, docsSigned: 0, tabVisits: { home: 4, docs: 1, templates: 3, knowledge: 4, account: 0 }, avgSessionMin: 2, dropTab: "knowledge" },
  { id: 6, name: "Сергей Лебедев", phone: "+7 985 555-66-77", status: "self_employed", specialty: "Репетитор", registeredAt: "03.06.2024", lastLoginAt: "10.06.2024", loginCount: 11, paidAt: "05.06.2024", paymentAmount: 990, docsTotal: 6, docsSigned: 4, tabVisits: { home: 11, docs: 9, templates: 6, knowledge: 5, account: 2 }, avgSessionMin: 6, dropTab: null },
];

export const statusLabels: Record<string, string> = { self_employed: "Самозанятый", ip: "ИП", ooo: "ООО", individual: "Физлицо" };
export const statusColors: Record<string, string> = { self_employed: "bg-green-100 text-green-700", ip: "bg-blue-100 text-blue-700", ooo: "bg-purple-100 text-purple-700", individual: "bg-gray-100 text-gray-600" };
export const tabNames: Record<string, string> = { home: "Главная", docs: "Документы", templates: "Шаблоны", knowledge: "База знаний", account: "Профиль" };
