import { apiRequest } from "./queryClient";

// ─── Types ──────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
}

export interface Duplika {
  id: string;
  displayName: string;
  handle: string;
  bio: string | null;
  avatar: string | null;
  isPublic: boolean;
  initialMessage: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DuplikaWithCount extends Duplika {
  conversationCount: number;
}

export interface Fact {
  id: string;
  duplikaId: string;
  text: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QaPair {
  id: string;
  duplikaId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicToAvoid {
  id: string;
  duplikaId: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareableLink {
  id: string;
  duplikaId: string;
  title: string;
  url: string;
  type: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordResponse {
  id: string;
  duplikaId: string;
  keywords: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  duplikaId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  isUser: boolean;
  source: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface DuplikaStats {
  factsCount: number;
  qaCount: number;
  topicsCount: number;
  linksCount: number;
  keywordsCount: number;
  conversationCount: number;
}

export interface ContentSource {
  id: string;
  duplikaId: string;
  sourceType: string;
  sourceUrl: string;
  lastCrawledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth API ───────────────────────────────────────────────
export const authApi = {
  register: async (data: { username: string; password: string }): Promise<AuthUser> => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    return res.json();
  },

  login: async (data: { username: string; password: string }): Promise<AuthUser> => {
    const res = await apiRequest("POST", "/api/auth/login", data);
    return res.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  me: async (): Promise<AuthUser | null> => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },
};

// ─── Duplikas API ───────────────────────────────────────────
export const duplikasApi = {
  list: async (): Promise<Duplika[]> => {
    const res = await fetch("/api/duplikas", { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  popular: async (): Promise<DuplikaWithCount[]> => {
    const res = await fetch("/api/duplikas/popular", { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  get: async (id: string): Promise<Duplika> => {
    const res = await fetch(`/api/duplikas/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (data: { displayName: string; handle: string; bio?: string; avatar?: string; isPublic?: boolean; initialMessage?: string }): Promise<Duplika> => {
    const res = await apiRequest("POST", "/api/duplikas", data);
    return res.json();
  },

  update: async (id: string, data: Partial<{ displayName: string; handle: string; bio: string; avatar: string; isPublic: boolean; initialMessage: string }>): Promise<Duplika> => {
    const res = await apiRequest("PUT", `/api/duplikas/${id}`, data);
    return res.json();
  },

  updateVisibility: async (id: string, isPublic: boolean): Promise<Duplika> => {
    const res = await apiRequest("PUT", `/api/duplikas/${id}/visibility`, { isPublic });
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${id}`);
  },

  stats: async (id: string): Promise<DuplikaStats> => {
    const res = await fetch(`/api/duplikas/${id}/stats`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  conversations: async (id: string): Promise<Conversation[]> => {
    const res = await fetch(`/api/duplikas/${id}/conversations`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },
};

// ─── Facts API ──────────────────────────────────────────────
export const factsApi = {
  list: async (duplikaId: string): Promise<Fact[]> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/facts`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (duplikaId: string, data: { text: string; order?: number }): Promise<Fact> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/facts`, data);
    return res.json();
  },

  update: async (duplikaId: string, factId: string, data: { text?: string; order?: number }): Promise<Fact> => {
    const res = await apiRequest("PUT", `/api/duplikas/${duplikaId}/facts/${factId}`, data);
    return res.json();
  },

  delete: async (duplikaId: string, factId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${duplikaId}/facts/${factId}`);
  },
};

// ─── Q&A API ────────────────────────────────────────────────
export const qaApi = {
  list: async (duplikaId: string): Promise<QaPair[]> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/qa`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (duplikaId: string, data: { question: string; answer: string }): Promise<QaPair> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/qa`, data);
    return res.json();
  },

  update: async (duplikaId: string, qaId: string, data: { question?: string; answer?: string }): Promise<QaPair> => {
    const res = await apiRequest("PUT", `/api/duplikas/${duplikaId}/qa/${qaId}`, data);
    return res.json();
  },

  delete: async (duplikaId: string, qaId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${duplikaId}/qa/${qaId}`);
  },
};

// ─── Topics API ─────────────────────────────────────────────
export const topicsApi = {
  list: async (duplikaId: string): Promise<TopicToAvoid[]> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/topics-to-avoid`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (duplikaId: string, data: { topic: string }): Promise<TopicToAvoid> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/topics-to-avoid`, data);
    return res.json();
  },

  delete: async (duplikaId: string, topicId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${duplikaId}/topics-to-avoid/${topicId}`);
  },
};

// ─── Links API ──────────────────────────────────────────────
export const linksApi = {
  list: async (duplikaId: string): Promise<ShareableLink[]> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/shareable-links`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (duplikaId: string, data: { title: string; url: string; type?: string }): Promise<ShareableLink> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/shareable-links`, data);
    return res.json();
  },

  delete: async (duplikaId: string, linkId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${duplikaId}/shareable-links/${linkId}`);
  },
};

// ─── Keywords API ───────────────────────────────────────────
export const keywordsApi = {
  list: async (duplikaId: string): Promise<KeywordResponse[]> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/keyword-responses`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (duplikaId: string, data: { keywords: string; response: string }): Promise<KeywordResponse> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/keyword-responses`, data);
    return res.json();
  },

  update: async (duplikaId: string, resId: string, data: { keywords?: string; response?: string }): Promise<KeywordResponse> => {
    const res = await apiRequest("PUT", `/api/duplikas/${duplikaId}/keyword-responses/${resId}`, data);
    return res.json();
  },

  delete: async (duplikaId: string, resId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${duplikaId}/keyword-responses/${resId}`);
  },
};

// ─── Chat API ───────────────────────────────────────────────
export interface SendMessageResponse {
  userMessage: Message;
  aiMessage: Message;
  sources: Array<{ sourceType: string; sourceUrl: string; similarity: number }>;
}

export const chatApi = {
  createConversation: async (duplikaId: string): Promise<Conversation> => {
    const res = await apiRequest("POST", `/api/chat/${duplikaId}/conversations`);
    return res.json();
  },

  listConversations: async (duplikaId: string): Promise<Conversation[]> => {
    const res = await fetch(`/api/chat/${duplikaId}/conversations`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  sendMessage: async (conversationId: string, text: string): Promise<SendMessageResponse> => {
    const res = await apiRequest("POST", `/api/chat/conversations/${conversationId}/messages`, { text });
    return res.json();
  },
};

// ─── Public API ─────────────────────────────────────────────
export const publicApi = {
  getProfile: async (handle: string): Promise<Duplika> => {
    const res = await fetch(`/api/public/profiles/${handle}`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },
};

// ─── Content Sources API ────────────────────────────────────
export const contentSourcesApi = {
  list: async (duplikaId: string): Promise<ContentSource[]> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/content-sources`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },

  create: async (duplikaId: string, data: { sourceType: string; sourceUrl: string }): Promise<ContentSource> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/content-sources`, data);
    return res.json();
  },

  uploadPdf: async (duplikaId: string, fileName: string, fileData: string): Promise<ContentSource> => {
    const res = await apiRequest("POST", `/api/duplikas/${duplikaId}/content-sources/upload-pdf`, { fileName, fileData });
    return res.json();
  },

  delete: async (duplikaId: string, sourceId: string): Promise<void> => {
    await apiRequest("DELETE", `/api/duplikas/${duplikaId}/content-sources/${sourceId}`);
  },

  triggerCrawl: async (duplikaId: string): Promise<void> => {
    await apiRequest("POST", `/api/duplikas/${duplikaId}/sources/crawl`);
  },

  crawlStatus: async (duplikaId: string): Promise<unknown> => {
    const res = await fetch(`/api/duplikas/${duplikaId}/crawl-status`, { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json();
  },
};
