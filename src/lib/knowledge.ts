import { getToken } from "@/lib/auth";

const URL = "https://functions.poehali.dev/09118dd9-6caa-4d70-aa56-8ea9fddc1949";

export interface KnowledgeArticle {
  id: number;
  title: string;
  summary: string;
  body: string;
  video_url: string;
  category: string;
  icon: string;
  read_time: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export type ArticleDraft = Omit<KnowledgeArticle, "id"> & { id?: number };

async function call(body: Record<string, unknown>): Promise<any> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const knowledgeApi = {
  list: async (): Promise<{ articles: KnowledgeArticle[] }> => {
    const res = await fetch(URL);
    return res.json();
  },
  listAll: () => call({ action: "list_all" }) as Promise<{ articles: KnowledgeArticle[] }>,
  create: (draft: ArticleDraft) =>
    call({ action: "create", ...draft }) as Promise<{ article: KnowledgeArticle; error?: string }>,
  update: (draft: ArticleDraft) =>
    call({ action: "update", ...draft }) as Promise<{ article: KnowledgeArticle; error?: string }>,
  remove: (id: number) => call({ action: "delete", id }) as Promise<{ ok: boolean }>,
};

export const emptyArticle: ArticleDraft = {
  title: "",
  summary: "",
  body: "",
  video_url: "",
  category: "",
  icon: "BookOpen",
  read_time: "",
  featured: false,
  published: true,
  sort_order: 0,
};
