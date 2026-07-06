export const CHECK_INN_URL = "https://functions.poehali.dev/9aea3fe4-6f69-411a-8a01-c3e94cb8888c";
export const CLIENTS_URL = "https://functions.poehali.dev/f20320e8-6fc3-47b0-b7a3-ef74f5e1c1d5";
export const SERVICES_URL = "https://functions.poehali.dev/0b2cb816-5a7a-45c0-9659-94294105e94f";
export const INVOICES_URL = "https://functions.poehali.dev/b8539077-8a35-46ed-b604-3f9b439fafa1";

export const todayStr = () => new Date().toISOString().slice(0, 10);

export type ClientType = "ip" | "ooo" | "individual" | null;

export interface ClientInfo {
  id?: number;
  name: string;
  inn: string;
  ogrnip: string;
  address: string;
  client_type?: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  price: number | null;
  unit: string;
}

export interface InvoiceItem {
  name: string;
  qty: string;
  price: string;
}
