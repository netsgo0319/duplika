// Based on blueprint:javascript_database integration
import { 
  duplikas, conversations, messages, facts, qaPairs, 
  topicsToAvoid, shareableLinks, keywordResponses,
  type Duplika, type InsertDuplika,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Fact, type InsertFact,
  type QaPair, type InsertQaPair,
  type TopicToAvoid, type InsertTopicToAvoid,
  type ShareableLink, type InsertShareableLink,
  type KeywordResponse, type InsertKeywordResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Duplikas
  getDuplika(id: string): Promise<Duplika | undefined>;
  getDuplikaByHandle(handle: string): Promise<Duplika | undefined>;
  getDuplikasByUserId(userId: string): Promise<Duplika[]>;
  getPublicDuplikas(): Promise<Duplika[]>;
  createDuplika(duplika: InsertDuplika): Promise<Duplika>;
  updateDuplika(id: string, data: Partial<InsertDuplika>): Promise<Duplika>;
  deleteDuplika(id: string): Promise<void>;
  
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByDuplikaId(duplikaId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // Messages
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Facts
  getFactsByDuplikaId(duplikaId: string): Promise<Fact[]>;
  createFact(fact: InsertFact): Promise<Fact>;
  updateFact(id: string, content: string): Promise<Fact>;
  deleteFact(id: string): Promise<void>;
  
  // Q&A Pairs
  getQaPairsByDuplikaId(duplikaId: string): Promise<QaPair[]>;
  createQaPair(qaPair: InsertQaPair): Promise<QaPair>;
  updateQaPair(id: string, data: Partial<InsertQaPair>): Promise<QaPair>;
  deleteQaPair(id: string): Promise<void>;
  
  // Topics to Avoid
  getTopicsByDuplikaId(duplikaId: string): Promise<TopicToAvoid[]>;
  createTopic(topic: InsertTopicToAvoid): Promise<TopicToAvoid>;
  deleteTopic(id: string): Promise<void>;
  
  // Shareable Links
  getLinksByDuplikaId(duplikaId: string): Promise<ShareableLink[]>;
  createLink(link: InsertShareableLink): Promise<ShareableLink>;
  updateLink(id: string, data: Partial<InsertShareableLink>): Promise<ShareableLink>;
  deleteLink(id: string): Promise<void>;
  
  // Keyword Responses
  getKeywordsByDuplikaId(duplikaId: string): Promise<KeywordResponse[]>;
  createKeyword(keyword: InsertKeywordResponse): Promise<KeywordResponse>;
  updateKeyword(id: string, data: Partial<InsertKeywordResponse>): Promise<KeywordResponse>;
  deleteKeyword(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Duplikas
  async getDuplika(id: string): Promise<Duplika | undefined> {
    const [duplika] = await db.select().from(duplikas).where(eq(duplikas.id, id));
    return duplika || undefined;
  }
  
  async getDuplikaByHandle(handle: string): Promise<Duplika | undefined> {
    const [duplika] = await db.select().from(duplikas).where(eq(duplikas.handle, handle));
    return duplika || undefined;
  }
  
  async getDuplikasByUserId(userId: string): Promise<Duplika[]> {
    return db.select().from(duplikas).where(eq(duplikas.userId, userId)).orderBy(desc(duplikas.createdAt));
  }
  
  async getPublicDuplikas(): Promise<Duplika[]> {
    return db.select().from(duplikas).where(eq(duplikas.isPublic, true)).orderBy(desc(duplikas.followerCount));
  }
  
  async createDuplika(duplika: InsertDuplika): Promise<Duplika> {
    const [created] = await db.insert(duplikas).values(duplika).returning();
    return created;
  }
  
  async updateDuplika(id: string, data: Partial<InsertDuplika>): Promise<Duplika> {
    const [updated] = await db.update(duplikas).set(data).where(eq(duplikas.id, id)).returning();
    return updated;
  }
  
  async deleteDuplika(id: string): Promise<void> {
    await db.delete(duplikas).where(eq(duplikas.id, id));
  }
  
  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }
  
  async getConversationsByDuplikaId(duplikaId: string): Promise<Conversation[]> {
    return db.select().from(conversations).where(eq(conversations.duplikaId, duplikaId)).orderBy(desc(conversations.updatedAt));
  }
  
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation).returning();
    return created;
  }
  
  // Messages
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }
  
  // Facts
  async getFactsByDuplikaId(duplikaId: string): Promise<Fact[]> {
    return db.select().from(facts).where(eq(facts.duplikaId, duplikaId)).orderBy(facts.createdAt);
  }
  
  async createFact(fact: InsertFact): Promise<Fact> {
    const [created] = await db.insert(facts).values(fact).returning();
    return created;
  }
  
  async updateFact(id: string, content: string): Promise<Fact> {
    const [updated] = await db.update(facts).set({ content }).where(eq(facts.id, id)).returning();
    return updated;
  }
  
  async deleteFact(id: string): Promise<void> {
    await db.delete(facts).where(eq(facts.id, id));
  }
  
  // Q&A Pairs
  async getQaPairsByDuplikaId(duplikaId: string): Promise<QaPair[]> {
    return db.select().from(qaPairs).where(eq(qaPairs.duplikaId, duplikaId)).orderBy(qaPairs.createdAt);
  }
  
  async createQaPair(qaPair: InsertQaPair): Promise<QaPair> {
    const [created] = await db.insert(qaPairs).values(qaPair).returning();
    return created;
  }
  
  async updateQaPair(id: string, data: Partial<InsertQaPair>): Promise<QaPair> {
    const [updated] = await db.update(qaPairs).set(data).where(eq(qaPairs.id, id)).returning();
    return updated;
  }
  
  async deleteQaPair(id: string): Promise<void> {
    await db.delete(qaPairs).where(eq(qaPairs.id, id));
  }
  
  // Topics to Avoid
  async getTopicsByDuplikaId(duplikaId: string): Promise<TopicToAvoid[]> {
    return db.select().from(topicsToAvoid).where(eq(topicsToAvoid.duplikaId, duplikaId)).orderBy(topicsToAvoid.createdAt);
  }
  
  async createTopic(topic: InsertTopicToAvoid): Promise<TopicToAvoid> {
    const [created] = await db.insert(topicsToAvoid).values(topic).returning();
    return created;
  }
  
  async deleteTopic(id: string): Promise<void> {
    await db.delete(topicsToAvoid).where(eq(topicsToAvoid.id, id));
  }
  
  // Shareable Links
  async getLinksByDuplikaId(duplikaId: string): Promise<ShareableLink[]> {
    return db.select().from(shareableLinks).where(eq(shareableLinks.duplikaId, duplikaId)).orderBy(shareableLinks.createdAt);
  }
  
  async createLink(link: InsertShareableLink): Promise<ShareableLink> {
    const [created] = await db.insert(shareableLinks).values(link).returning();
    return created;
  }
  
  async updateLink(id: string, data: Partial<InsertShareableLink>): Promise<ShareableLink> {
    const [updated] = await db.update(shareableLinks).set(data).where(eq(shareableLinks.id, id)).returning();
    return updated;
  }
  
  async deleteLink(id: string): Promise<void> {
    await db.delete(shareableLinks).where(eq(shareableLinks.id, id));
  }
  
  // Keyword Responses
  async getKeywordsByDuplikaId(duplikaId: string): Promise<KeywordResponse[]> {
    return db.select().from(keywordResponses).where(eq(keywordResponses.duplikaId, duplikaId)).orderBy(keywordResponses.createdAt);
  }
  
  async createKeyword(keyword: InsertKeywordResponse): Promise<KeywordResponse> {
    const [created] = await db.insert(keywordResponses).values(keyword).returning();
    return created;
  }
  
  async updateKeyword(id: string, data: Partial<InsertKeywordResponse>): Promise<KeywordResponse> {
    const [updated] = await db.update(keywordResponses).set(data).where(eq(keywordResponses.id, id)).returning();
    return updated;
  }
  
  async deleteKeyword(id: string): Promise<void> {
    await db.delete(keywordResponses).where(eq(keywordResponses.id, id));
  }
}

export const storage = new DatabaseStorage();
