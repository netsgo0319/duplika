import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Duplika,
  InsertDuplika,
  Fact,
  InsertFact,
  QaPair,
  InsertQaPair,
  Topic,
  InsertTopic,
  ShareableLink,
  InsertShareableLink,
  KeywordResponse,
  InsertKeywordResponse,
  Message,
  InsertMessage,
  ContentItem,
  InsertContentItem,
} from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool, { schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Duplikas
  getAllDuplikas(): Promise<Duplika[]>;
  getPublicDuplikas(): Promise<Duplika[]>;
  getDuplikaById(id: string): Promise<Duplika | undefined>;
  getDuplikaByHandle(handle: string): Promise<Duplika | undefined>;
  createDuplika(duplika: InsertDuplika): Promise<Duplika>;
  updateDuplika(id: string, duplika: Partial<InsertDuplika>): Promise<Duplika | undefined>;
  deleteDuplika(id: string): Promise<void>;

  // Facts
  getFactsByDuplikaId(duplikaId: string): Promise<Fact[]>;
  createFact(fact: InsertFact): Promise<Fact>;
  updateFact(id: string, text: string): Promise<Fact | undefined>;
  deleteFact(id: string): Promise<void>;

  // Q&A Pairs
  getQaPairsByDuplikaId(duplikaId: string): Promise<QaPair[]>;
  createQaPair(qaPair: InsertQaPair): Promise<QaPair>;
  updateQaPair(id: string, question: string, answer: string): Promise<QaPair | undefined>;
  deleteQaPair(id: string): Promise<void>;

  // Topics to Avoid
  getTopicsByDuplikaId(duplikaId: string): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;

  // Shareable Links
  getLinksByDuplikaId(duplikaId: string): Promise<ShareableLink[]>;
  createLink(link: InsertShareableLink): Promise<ShareableLink>;
  deleteLink(id: string): Promise<void>;

  // Keyword Responses
  getKeywordResponsesByDuplikaId(duplikaId: string): Promise<KeywordResponse[]>;
  createKeywordResponse(response: InsertKeywordResponse): Promise<KeywordResponse>;
  updateKeywordResponse(id: string, keywords: string, response: string): Promise<KeywordResponse | undefined>;
  deleteKeywordResponse(id: string): Promise<void>;

  // Messages
  getMessagesByDuplikaId(duplikaId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Content Items
  getContentItemsByDuplikaId(duplikaId: string): Promise<ContentItem[]>;
  createContentItem(item: InsertContentItem): Promise<ContentItem>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Duplikas
  async getAllDuplikas(): Promise<Duplika[]> {
    return db.select().from(schema.duplikas).orderBy(desc(schema.duplikas.createdAt));
  }

  async getPublicDuplikas(): Promise<Duplika[]> {
    return db.select().from(schema.duplikas).where(eq(schema.duplikas.isPublic, true)).orderBy(desc(schema.duplikas.followers));
  }

  async getDuplikaById(id: string): Promise<Duplika | undefined> {
    const result = await db.select().from(schema.duplikas).where(eq(schema.duplikas.id, id)).limit(1);
    return result[0];
  }

  async getDuplikaByHandle(handle: string): Promise<Duplika | undefined> {
    const result = await db.select().from(schema.duplikas).where(eq(schema.duplikas.handle, handle)).limit(1);
    return result[0];
  }

  async createDuplika(duplika: InsertDuplika): Promise<Duplika> {
    const result = await db.insert(schema.duplikas).values(duplika).returning();
    return result[0];
  }

  async updateDuplika(id: string, duplika: Partial<InsertDuplika>): Promise<Duplika | undefined> {
    const result = await db.update(schema.duplikas).set(duplika).where(eq(schema.duplikas.id, id)).returning();
    return result[0];
  }

  async deleteDuplika(id: string): Promise<void> {
    await db.delete(schema.duplikas).where(eq(schema.duplikas.id, id));
  }

  // Facts
  async getFactsByDuplikaId(duplikaId: string): Promise<Fact[]> {
    return db.select().from(schema.facts).where(eq(schema.facts.duplikaId, duplikaId)).orderBy(desc(schema.facts.createdAt));
  }

  async createFact(fact: InsertFact): Promise<Fact> {
    const result = await db.insert(schema.facts).values(fact).returning();
    return result[0];
  }

  async updateFact(id: string, text: string): Promise<Fact | undefined> {
    const result = await db.update(schema.facts).set({ text }).where(eq(schema.facts.id, id)).returning();
    return result[0];
  }

  async deleteFact(id: string): Promise<void> {
    await db.delete(schema.facts).where(eq(schema.facts.id, id));
  }

  // Q&A Pairs
  async getQaPairsByDuplikaId(duplikaId: string): Promise<QaPair[]> {
    return db.select().from(schema.qaPairs).where(eq(schema.qaPairs.duplikaId, duplikaId)).orderBy(desc(schema.qaPairs.createdAt));
  }

  async createQaPair(qaPair: InsertQaPair): Promise<QaPair> {
    const result = await db.insert(schema.qaPairs).values(qaPair).returning();
    return result[0];
  }

  async updateQaPair(id: string, question: string, answer: string): Promise<QaPair | undefined> {
    const result = await db.update(schema.qaPairs).set({ question, answer }).where(eq(schema.qaPairs.id, id)).returning();
    return result[0];
  }

  async deleteQaPair(id: string): Promise<void> {
    await db.delete(schema.qaPairs).where(eq(schema.qaPairs.id, id));
  }

  // Topics to Avoid
  async getTopicsByDuplikaId(duplikaId: string): Promise<Topic[]> {
    return db.select().from(schema.topicsToAvoid).where(eq(schema.topicsToAvoid.duplikaId, duplikaId)).orderBy(desc(schema.topicsToAvoid.createdAt));
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const result = await db.insert(schema.topicsToAvoid).values(topic).returning();
    return result[0];
  }

  async deleteTopic(id: string): Promise<void> {
    await db.delete(schema.topicsToAvoid).where(eq(schema.topicsToAvoid.id, id));
  }

  // Shareable Links
  async getLinksByDuplikaId(duplikaId: string): Promise<ShareableLink[]> {
    return db.select().from(schema.shareableLinks).where(eq(schema.shareableLinks.duplikaId, duplikaId)).orderBy(desc(schema.shareableLinks.createdAt));
  }

  async createLink(link: InsertShareableLink): Promise<ShareableLink> {
    const result = await db.insert(schema.shareableLinks).values(link).returning();
    return result[0];
  }

  async deleteLink(id: string): Promise<void> {
    await db.delete(schema.shareableLinks).where(eq(schema.shareableLinks.id, id));
  }

  // Keyword Responses
  async getKeywordResponsesByDuplikaId(duplikaId: string): Promise<KeywordResponse[]> {
    return db.select().from(schema.keywordResponses).where(eq(schema.keywordResponses.duplikaId, duplikaId)).orderBy(desc(schema.keywordResponses.createdAt));
  }

  async createKeywordResponse(response: InsertKeywordResponse): Promise<KeywordResponse> {
    const result = await db.insert(schema.keywordResponses).values(response).returning();
    return result[0];
  }

  async updateKeywordResponse(id: string, keywords: string, response: string): Promise<KeywordResponse | undefined> {
    const result = await db.update(schema.keywordResponses).set({ keywords, response }).where(eq(schema.keywordResponses.id, id)).returning();
    return result[0];
  }

  async deleteKeywordResponse(id: string): Promise<void> {
    await db.delete(schema.keywordResponses).where(eq(schema.keywordResponses.id, id));
  }

  // Messages
  async getMessagesByDuplikaId(duplikaId: string, limit: number = 50): Promise<Message[]> {
    return db.select().from(schema.messages).where(eq(schema.messages.duplikaId, duplikaId)).orderBy(desc(schema.messages.createdAt)).limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(schema.messages).values(message).returning();
    return result[0];
  }

  // Content Items
  async getContentItemsByDuplikaId(duplikaId: string): Promise<ContentItem[]> {
    return db.select().from(schema.contentItems).where(eq(schema.contentItems.duplikaId, duplikaId)).orderBy(desc(schema.contentItems.createdAt));
  }

  async createContentItem(item: InsertContentItem): Promise<ContentItem> {
    const result = await db.insert(schema.contentItems).values(item).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
