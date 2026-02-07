import {
  type User,
  type InsertUser,
  type Duplika,
  type InsertDuplika,
  type Fact,
  type InsertFact,
  type QaPair,
  type InsertQaPair,
  type TopicToAvoid,
  type InsertTopicToAvoid,
  type ShareableLink,
  type InsertShareableLink,
  type KeywordResponse,
  type InsertKeywordResponse,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type ContentSource,
  type InsertContentSource,
  type ContentChunk,
  type InsertContentChunk,
  users,
  duplikas,
  facts,
  qaPairs,
  topicsToAvoid,
  shareableLinks,
  keywordResponses,
  conversations,
  messages,
  contentSources,
  contentChunks,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";

// ─── IStorage interface ─────────────────────────────────────
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Duplikas
  getDuplika(id: string): Promise<Duplika | undefined>;
  getDuplikasByOwner(ownerId: string): Promise<Duplika[]>;
  getDuplikaByHandle(handle: string): Promise<Duplika | undefined>;
  getPublicDuplikas(): Promise<Duplika[]>;
  createDuplika(duplika: InsertDuplika): Promise<Duplika>;
  updateDuplika(id: string, data: Partial<InsertDuplika>): Promise<Duplika | undefined>;
  deleteDuplika(id: string): Promise<boolean>;

  // Facts
  getFactsByDuplika(duplikaId: string): Promise<Fact[]>;
  createFact(fact: InsertFact): Promise<Fact>;
  updateFact(id: string, data: Partial<InsertFact>): Promise<Fact | undefined>;
  deleteFact(id: string): Promise<boolean>;

  // Q&A Pairs
  getQaPairsByDuplika(duplikaId: string): Promise<QaPair[]>;
  createQaPair(qaPair: InsertQaPair): Promise<QaPair>;
  updateQaPair(id: string, data: Partial<InsertQaPair>): Promise<QaPair | undefined>;
  deleteQaPair(id: string): Promise<boolean>;

  // Topics to Avoid
  getTopicsToAvoidByDuplika(duplikaId: string): Promise<TopicToAvoid[]>;
  createTopicToAvoid(topic: InsertTopicToAvoid): Promise<TopicToAvoid>;
  deleteTopicToAvoid(id: string): Promise<boolean>;

  // Shareable Links
  getShareableLinksByDuplika(duplikaId: string): Promise<ShareableLink[]>;
  createShareableLink(link: InsertShareableLink): Promise<ShareableLink>;
  deleteShareableLink(id: string): Promise<boolean>;

  // Keyword Responses
  getKeywordResponsesByDuplika(duplikaId: string): Promise<KeywordResponse[]>;
  createKeywordResponse(kr: InsertKeywordResponse): Promise<KeywordResponse>;
  updateKeywordResponse(id: string, data: Partial<InsertKeywordResponse>): Promise<KeywordResponse | undefined>;
  deleteKeywordResponse(id: string): Promise<boolean>;

  // Batch deletes (for cascading duplika deletion)
  deleteFactsByDuplika(duplikaId: string): Promise<void>;
  deleteQaPairsByDuplika(duplikaId: string): Promise<void>;
  deleteTopicsByDuplika(duplikaId: string): Promise<void>;
  deleteLinksByDuplika(duplikaId: string): Promise<void>;
  deleteKeywordResponsesByDuplika(duplikaId: string): Promise<void>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByDuplika(duplikaId: string): Promise<Conversation[]>;
  getConversationCountByDuplika(duplikaId: string): Promise<number>;
  createConversation(conv: InsertConversation): Promise<Conversation>;

  // Messages
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Content Sources
  getContentSourcesByDuplika(duplikaId: string): Promise<ContentSource[]>;
  createContentSource(source: InsertContentSource): Promise<ContentSource>;
  deleteContentSource(id: string): Promise<boolean>;

  // Content Chunks
  getContentChunksByDuplika(duplikaId: string): Promise<ContentChunk[]>;
  createContentChunk(chunk: InsertContentChunk): Promise<ContentChunk>;
}

// ─── MemStorage (for tests and development without DB) ──────
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private duplikasMap: Map<string, Duplika> = new Map();
  private factsMap: Map<string, Fact> = new Map();
  private qaPairsMap: Map<string, QaPair> = new Map();
  private topicsMap: Map<string, TopicToAvoid> = new Map();
  private linksMap: Map<string, ShareableLink> = new Map();
  private keywordResponsesMap: Map<string, KeywordResponse> = new Map();
  private conversationsMap: Map<string, Conversation> = new Map();
  private messagesMap: Map<string, Message> = new Map();
  private contentSourcesMap: Map<string, ContentSource> = new Map();
  private contentChunksMap: Map<string, ContentChunk> = new Map();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  // Duplikas
  async getDuplika(id: string): Promise<Duplika | undefined> {
    return this.duplikasMap.get(id);
  }

  async getDuplikasByOwner(ownerId: string): Promise<Duplika[]> {
    return Array.from(this.duplikasMap.values()).filter((d) => d.ownerId === ownerId);
  }

  async getDuplikaByHandle(handle: string): Promise<Duplika | undefined> {
    return Array.from(this.duplikasMap.values()).find((d) => d.handle === handle);
  }

  async getPublicDuplikas(): Promise<Duplika[]> {
    return Array.from(this.duplikasMap.values()).filter((d) => d.isPublic);
  }

  async createDuplika(insert: InsertDuplika): Promise<Duplika> {
    const id = randomUUID();
    const now = new Date();
    const duplika: Duplika = {
      id,
      displayName: insert.displayName,
      handle: insert.handle,
      bio: insert.bio ?? null,
      avatar: insert.avatar ?? null,
      isPublic: insert.isPublic ?? true,
      initialMessage: insert.initialMessage ?? null,
      ownerId: insert.ownerId,
      createdAt: now,
      updatedAt: now,
    };
    this.duplikasMap.set(id, duplika);
    return duplika;
  }

  async updateDuplika(id: string, data: Partial<InsertDuplika>): Promise<Duplika | undefined> {
    const existing = this.duplikasMap.get(id);
    if (!existing) return undefined;
    const updated: Duplika = { ...existing, ...data, updatedAt: new Date() };
    this.duplikasMap.set(id, updated);
    return updated;
  }

  async deleteDuplika(id: string): Promise<boolean> {
    return this.duplikasMap.delete(id);
  }

  // Facts
  async getFactsByDuplika(duplikaId: string): Promise<Fact[]> {
    return Array.from(this.factsMap.values()).filter((f) => f.duplikaId === duplikaId);
  }

  async createFact(insert: InsertFact): Promise<Fact> {
    const id = randomUUID();
    const now = new Date();
    const fact: Fact = {
      id,
      duplikaId: insert.duplikaId,
      text: insert.text,
      order: insert.order ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    this.factsMap.set(id, fact);
    return fact;
  }

  async updateFact(id: string, data: Partial<InsertFact>): Promise<Fact | undefined> {
    const existing = this.factsMap.get(id);
    if (!existing) return undefined;
    const updated: Fact = { ...existing, ...data, updatedAt: new Date() };
    this.factsMap.set(id, updated);
    return updated;
  }

  async deleteFact(id: string): Promise<boolean> {
    return this.factsMap.delete(id);
  }

  // Q&A Pairs
  async getQaPairsByDuplika(duplikaId: string): Promise<QaPair[]> {
    return Array.from(this.qaPairsMap.values()).filter((q) => q.duplikaId === duplikaId);
  }

  async createQaPair(insert: InsertQaPair): Promise<QaPair> {
    const id = randomUUID();
    const now = new Date();
    const qa: QaPair = {
      id,
      duplikaId: insert.duplikaId,
      question: insert.question,
      answer: insert.answer,
      createdAt: now,
      updatedAt: now,
    };
    this.qaPairsMap.set(id, qa);
    return qa;
  }

  async updateQaPair(id: string, data: Partial<InsertQaPair>): Promise<QaPair | undefined> {
    const existing = this.qaPairsMap.get(id);
    if (!existing) return undefined;
    const updated: QaPair = { ...existing, ...data, updatedAt: new Date() };
    this.qaPairsMap.set(id, updated);
    return updated;
  }

  async deleteQaPair(id: string): Promise<boolean> {
    return this.qaPairsMap.delete(id);
  }

  // Topics to Avoid
  async getTopicsToAvoidByDuplika(duplikaId: string): Promise<TopicToAvoid[]> {
    return Array.from(this.topicsMap.values()).filter((t) => t.duplikaId === duplikaId);
  }

  async createTopicToAvoid(insert: InsertTopicToAvoid): Promise<TopicToAvoid> {
    const id = randomUUID();
    const now = new Date();
    const topic: TopicToAvoid = {
      id,
      duplikaId: insert.duplikaId,
      topic: insert.topic,
      createdAt: now,
      updatedAt: now,
    };
    this.topicsMap.set(id, topic);
    return topic;
  }

  async deleteTopicToAvoid(id: string): Promise<boolean> {
    return this.topicsMap.delete(id);
  }

  // Shareable Links
  async getShareableLinksByDuplika(duplikaId: string): Promise<ShareableLink[]> {
    return Array.from(this.linksMap.values()).filter((l) => l.duplikaId === duplikaId);
  }

  async createShareableLink(insert: InsertShareableLink): Promise<ShareableLink> {
    const id = randomUUID();
    const now = new Date();
    const link: ShareableLink = {
      id,
      duplikaId: insert.duplikaId,
      title: insert.title,
      url: insert.url,
      type: insert.type ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.linksMap.set(id, link);
    return link;
  }

  async deleteShareableLink(id: string): Promise<boolean> {
    return this.linksMap.delete(id);
  }

  // Keyword Responses
  async getKeywordResponsesByDuplika(duplikaId: string): Promise<KeywordResponse[]> {
    return Array.from(this.keywordResponsesMap.values()).filter(
      (kr) => kr.duplikaId === duplikaId,
    );
  }

  async createKeywordResponse(insert: InsertKeywordResponse): Promise<KeywordResponse> {
    const id = randomUUID();
    const now = new Date();
    const kr: KeywordResponse = {
      id,
      duplikaId: insert.duplikaId,
      keywords: insert.keywords,
      response: insert.response,
      createdAt: now,
      updatedAt: now,
    };
    this.keywordResponsesMap.set(id, kr);
    return kr;
  }

  async updateKeywordResponse(
    id: string,
    data: Partial<InsertKeywordResponse>,
  ): Promise<KeywordResponse | undefined> {
    const existing = this.keywordResponsesMap.get(id);
    if (!existing) return undefined;
    const updated: KeywordResponse = { ...existing, ...data, updatedAt: new Date() };
    this.keywordResponsesMap.set(id, updated);
    return updated;
  }

  async deleteKeywordResponse(id: string): Promise<boolean> {
    return this.keywordResponsesMap.delete(id);
  }

  // Batch deletes
  async deleteFactsByDuplika(duplikaId: string): Promise<void> {
    this.factsMap.forEach((f, id) => {
      if (f.duplikaId === duplikaId) this.factsMap.delete(id);
    });
  }

  async deleteQaPairsByDuplika(duplikaId: string): Promise<void> {
    this.qaPairsMap.forEach((q, id) => {
      if (q.duplikaId === duplikaId) this.qaPairsMap.delete(id);
    });
  }

  async deleteTopicsByDuplika(duplikaId: string): Promise<void> {
    this.topicsMap.forEach((t, id) => {
      if (t.duplikaId === duplikaId) this.topicsMap.delete(id);
    });
  }

  async deleteLinksByDuplika(duplikaId: string): Promise<void> {
    this.linksMap.forEach((l, id) => {
      if (l.duplikaId === duplikaId) this.linksMap.delete(id);
    });
  }

  async deleteKeywordResponsesByDuplika(duplikaId: string): Promise<void> {
    this.keywordResponsesMap.forEach((kr, id) => {
      if (kr.duplikaId === duplikaId) this.keywordResponsesMap.delete(id);
    });
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversationsMap.get(id);
  }

  async getConversationsByDuplika(duplikaId: string): Promise<Conversation[]> {
    return Array.from(this.conversationsMap.values()).filter(
      (c) => c.duplikaId === duplikaId,
    );
  }

  async getConversationCountByDuplika(duplikaId: string): Promise<number> {
    return Array.from(this.conversationsMap.values()).filter(
      (c) => c.duplikaId === duplikaId,
    ).length;
  }

  async createConversation(insert: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conv: Conversation = {
      id,
      duplikaId: insert.duplikaId,
      userId: insert.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.conversationsMap.set(id, conv);
    return conv;
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      (m) => m.conversationId === conversationId,
    );
  }

  async createMessage(insert: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const now = new Date();
    const msg: Message = {
      id,
      conversationId: insert.conversationId,
      text: insert.text,
      isUser: insert.isUser,
      source: insert.source ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.messagesMap.set(id, msg);
    return msg;
  }

  // Content Sources
  async getContentSourcesByDuplika(duplikaId: string): Promise<ContentSource[]> {
    return Array.from(this.contentSourcesMap.values()).filter(
      (s) => s.duplikaId === duplikaId,
    );
  }

  async createContentSource(insert: InsertContentSource): Promise<ContentSource> {
    const id = randomUUID();
    const now = new Date();
    const source: ContentSource = {
      id,
      duplikaId: insert.duplikaId,
      sourceType: insert.sourceType,
      sourceUrl: insert.sourceUrl,
      lastCrawledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.contentSourcesMap.set(id, source);
    return source;
  }

  async deleteContentSource(id: string): Promise<boolean> {
    return this.contentSourcesMap.delete(id);
  }

  // Content Chunks
  async getContentChunksByDuplika(duplikaId: string): Promise<ContentChunk[]> {
    return Array.from(this.contentChunksMap.values()).filter(
      (c) => c.duplikaId === duplikaId,
    );
  }

  async createContentChunk(insert: InsertContentChunk): Promise<ContentChunk> {
    const id = randomUUID();
    const now = new Date();
    const chunk: ContentChunk = {
      id,
      duplikaId: insert.duplikaId,
      sourceType: insert.sourceType,
      sourceUrl: insert.sourceUrl,
      chunkText: insert.chunkText,
      embedding: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
    };
    this.contentChunksMap.set(id, chunk);
    return chunk;
  }
}

// ─── DatabaseStorage (requires DATABASE_URL) ────────────────
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(insertUser).returning();
    return user;
  }

  // Duplikas
  async getDuplika(id: string): Promise<Duplika | undefined> {
    const [d] = await db!.select().from(duplikas).where(eq(duplikas.id, id));
    return d;
  }

  async getDuplikasByOwner(ownerId: string): Promise<Duplika[]> {
    return db!.select().from(duplikas).where(eq(duplikas.ownerId, ownerId));
  }

  async getDuplikaByHandle(handle: string): Promise<Duplika | undefined> {
    const [d] = await db!.select().from(duplikas).where(eq(duplikas.handle, handle));
    return d;
  }

  async getPublicDuplikas(): Promise<Duplika[]> {
    return db!.select().from(duplikas).where(eq(duplikas.isPublic, true));
  }

  async createDuplika(insert: InsertDuplika): Promise<Duplika> {
    const [d] = await db!.insert(duplikas).values(insert).returning();
    return d;
  }

  async updateDuplika(id: string, data: Partial<InsertDuplika>): Promise<Duplika | undefined> {
    const [d] = await db!
      .update(duplikas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(duplikas.id, id))
      .returning();
    return d;
  }

  async deleteDuplika(id: string): Promise<boolean> {
    const result = await db!.delete(duplikas).where(eq(duplikas.id, id)).returning();
    return result.length > 0;
  }

  // Facts
  async getFactsByDuplika(duplikaId: string): Promise<Fact[]> {
    return db!.select().from(facts).where(eq(facts.duplikaId, duplikaId));
  }

  async createFact(insert: InsertFact): Promise<Fact> {
    const [f] = await db!.insert(facts).values(insert).returning();
    return f;
  }

  async updateFact(id: string, data: Partial<InsertFact>): Promise<Fact | undefined> {
    const [f] = await db!
      .update(facts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(facts.id, id))
      .returning();
    return f;
  }

  async deleteFact(id: string): Promise<boolean> {
    const result = await db!.delete(facts).where(eq(facts.id, id)).returning();
    return result.length > 0;
  }

  // Q&A Pairs
  async getQaPairsByDuplika(duplikaId: string): Promise<QaPair[]> {
    return db!.select().from(qaPairs).where(eq(qaPairs.duplikaId, duplikaId));
  }

  async createQaPair(insert: InsertQaPair): Promise<QaPair> {
    const [qa] = await db!.insert(qaPairs).values(insert).returning();
    return qa;
  }

  async updateQaPair(id: string, data: Partial<InsertQaPair>): Promise<QaPair | undefined> {
    const [qa] = await db!
      .update(qaPairs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(qaPairs.id, id))
      .returning();
    return qa;
  }

  async deleteQaPair(id: string): Promise<boolean> {
    const result = await db!.delete(qaPairs).where(eq(qaPairs.id, id)).returning();
    return result.length > 0;
  }

  // Topics to Avoid
  async getTopicsToAvoidByDuplika(duplikaId: string): Promise<TopicToAvoid[]> {
    return db!.select().from(topicsToAvoid).where(eq(topicsToAvoid.duplikaId, duplikaId));
  }

  async createTopicToAvoid(insert: InsertTopicToAvoid): Promise<TopicToAvoid> {
    const [t] = await db!.insert(topicsToAvoid).values(insert).returning();
    return t;
  }

  async deleteTopicToAvoid(id: string): Promise<boolean> {
    const result = await db!.delete(topicsToAvoid).where(eq(topicsToAvoid.id, id)).returning();
    return result.length > 0;
  }

  // Shareable Links
  async getShareableLinksByDuplika(duplikaId: string): Promise<ShareableLink[]> {
    return db!.select().from(shareableLinks).where(eq(shareableLinks.duplikaId, duplikaId));
  }

  async createShareableLink(insert: InsertShareableLink): Promise<ShareableLink> {
    const [l] = await db!.insert(shareableLinks).values(insert).returning();
    return l;
  }

  async deleteShareableLink(id: string): Promise<boolean> {
    const result = await db!.delete(shareableLinks).where(eq(shareableLinks.id, id)).returning();
    return result.length > 0;
  }

  // Keyword Responses
  async getKeywordResponsesByDuplika(duplikaId: string): Promise<KeywordResponse[]> {
    return db!.select().from(keywordResponses).where(eq(keywordResponses.duplikaId, duplikaId));
  }

  async createKeywordResponse(insert: InsertKeywordResponse): Promise<KeywordResponse> {
    const [kr] = await db!.insert(keywordResponses).values(insert).returning();
    return kr;
  }

  async updateKeywordResponse(
    id: string,
    data: Partial<InsertKeywordResponse>,
  ): Promise<KeywordResponse | undefined> {
    const [kr] = await db!
      .update(keywordResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(keywordResponses.id, id))
      .returning();
    return kr;
  }

  async deleteKeywordResponse(id: string): Promise<boolean> {
    const result = await db!.delete(keywordResponses).where(eq(keywordResponses.id, id)).returning();
    return result.length > 0;
  }

  // Batch deletes
  async deleteFactsByDuplika(duplikaId: string): Promise<void> {
    await db!.delete(facts).where(eq(facts.duplikaId, duplikaId));
  }

  async deleteQaPairsByDuplika(duplikaId: string): Promise<void> {
    await db!.delete(qaPairs).where(eq(qaPairs.duplikaId, duplikaId));
  }

  async deleteTopicsByDuplika(duplikaId: string): Promise<void> {
    await db!.delete(topicsToAvoid).where(eq(topicsToAvoid.duplikaId, duplikaId));
  }

  async deleteLinksByDuplika(duplikaId: string): Promise<void> {
    await db!.delete(shareableLinks).where(eq(shareableLinks.duplikaId, duplikaId));
  }

  async deleteKeywordResponsesByDuplika(duplikaId: string): Promise<void> {
    await db!.delete(keywordResponses).where(eq(keywordResponses.duplikaId, duplikaId));
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [c] = await db!.select().from(conversations).where(eq(conversations.id, id));
    return c;
  }

  async getConversationsByDuplika(duplikaId: string): Promise<Conversation[]> {
    return db!.select().from(conversations).where(eq(conversations.duplikaId, duplikaId));
  }

  async getConversationCountByDuplika(duplikaId: string): Promise<number> {
    const rows = await db!.select().from(conversations).where(eq(conversations.duplikaId, duplikaId));
    return rows.length;
  }

  async createConversation(insert: InsertConversation): Promise<Conversation> {
    const [c] = await db!.insert(conversations).values(insert).returning();
    return c;
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db!.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async createMessage(insert: InsertMessage): Promise<Message> {
    const [m] = await db!.insert(messages).values(insert).returning();
    return m;
  }

  // Content Sources
  async getContentSourcesByDuplika(duplikaId: string): Promise<ContentSource[]> {
    return db!.select().from(contentSources).where(eq(contentSources.duplikaId, duplikaId));
  }

  async createContentSource(insert: InsertContentSource): Promise<ContentSource> {
    const [s] = await db!.insert(contentSources).values(insert).returning();
    return s;
  }

  async deleteContentSource(id: string): Promise<boolean> {
    const result = await db!.delete(contentSources).where(eq(contentSources.id, id)).returning();
    return result.length > 0;
  }

  // Content Chunks
  async getContentChunksByDuplika(duplikaId: string): Promise<ContentChunk[]> {
    return db!.select().from(contentChunks).where(eq(contentChunks.duplikaId, duplikaId));
  }

  async createContentChunk(insert: InsertContentChunk): Promise<ContentChunk> {
    const [c] = await db!.insert(contentChunks).values(insert).returning();
    return c;
  }
}

// ─── Export storage singleton ───────────────────────────────
export const storage: IStorage = db ? new DatabaseStorage() : new MemStorage();
