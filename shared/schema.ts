import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Custom vector type for pgvector
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown) {
    return (value as string)
      .slice(1, -1)
      .split(",")
      .map(Number);
  },
});

// ─── 1. users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── 2. sessions (connect-pg-simple compatible) ─────────────
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6, withTimezone: false }).notNull(),
});

// ─── 3. duplikas ────────────────────────────────────────────
export const duplikas = pgTable("duplikas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  displayName: text("display_name").notNull(),
  handle: text("handle").notNull().unique(),
  bio: text("bio"),
  avatar: text("avatar"),
  isPublic: boolean("is_public").notNull().default(true),
  initialMessage: text("initial_message"),
  ownerId: varchar("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDuplikaSchema = createInsertSchema(duplikas).pick({
  displayName: true,
  handle: true,
  bio: true,
  avatar: true,
  isPublic: true,
  initialMessage: true,
  ownerId: true,
});

export type InsertDuplika = z.infer<typeof insertDuplikaSchema>;
export type Duplika = typeof duplikas.$inferSelect;

// ─── 4. facts ───────────────────────────────────────────────
export const facts = pgTable("facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  text: text("text").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFactSchema = createInsertSchema(facts).pick({
  duplikaId: true,
  text: true,
  order: true,
});

export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof facts.$inferSelect;

// ─── 5. qa_pairs ────────────────────────────────────────────
export const qaPairs = pgTable("qa_pairs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQaPairSchema = createInsertSchema(qaPairs).pick({
  duplikaId: true,
  question: true,
  answer: true,
});

export type InsertQaPair = z.infer<typeof insertQaPairSchema>;
export type QaPair = typeof qaPairs.$inferSelect;

// ─── 6. topics_to_avoid ─────────────────────────────────────
export const topicsToAvoid = pgTable("topics_to_avoid", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTopicToAvoidSchema = createInsertSchema(topicsToAvoid).pick({
  duplikaId: true,
  topic: true,
});

export type InsertTopicToAvoid = z.infer<typeof insertTopicToAvoidSchema>;
export type TopicToAvoid = typeof topicsToAvoid.$inferSelect;

// ─── 7. shareable_links ─────────────────────────────────────
export const shareableLinks = pgTable("shareable_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertShareableLinkSchema = createInsertSchema(shareableLinks).pick({
  duplikaId: true,
  title: true,
  url: true,
  type: true,
});

export type InsertShareableLink = z.infer<typeof insertShareableLinkSchema>;
export type ShareableLink = typeof shareableLinks.$inferSelect;

// ─── 8. keyword_responses ───────────────────────────────────
export const keywordResponses = pgTable("keyword_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  keywords: text("keywords").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKeywordResponseSchema = createInsertSchema(keywordResponses).pick({
  duplikaId: true,
  keywords: true,
  response: true,
});

export type InsertKeywordResponse = z.infer<typeof insertKeywordResponseSchema>;
export type KeywordResponse = typeof keywordResponses.$inferSelect;

// ─── 9. conversations ───────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  duplikaId: true,
  userId: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// ─── 10. messages ───────────────────────────────────────────
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id),
  text: text("text").notNull(),
  isUser: boolean("is_user").notNull(),
  source: jsonb("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  text: true,
  isUser: true,
  source: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ─── 11. content_sources ────────────────────────────────────
export const contentSources = pgTable("content_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id")
    .notNull()
    .references(() => duplikas.id),
  sourceType: text("source_type").notNull(),
  sourceUrl: text("source_url").notNull(),
  rawContent: text("raw_content"),
  lastCrawledAt: timestamp("last_crawled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContentSourceSchema = createInsertSchema(contentSources).pick({
  duplikaId: true,
  sourceType: true,
  sourceUrl: true,
  rawContent: true,
});

export type InsertContentSource = z.infer<typeof insertContentSourceSchema>;
export type ContentSource = typeof contentSources.$inferSelect;

// ─── 12. content_chunks ─────────────────────────────────────
export const contentChunks = pgTable(
  "content_chunks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    duplikaId: varchar("duplika_id")
      .notNull()
      .references(() => duplikas.id),
    sourceType: text("source_type").notNull(),
    sourceUrl: text("source_url").notNull(),
    chunkText: text("chunk_text").notNull(),
    embedding: vector("embedding"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("content_chunks_embedding_idx")
      .using("hnsw", table.embedding.op("vector_cosine_ops"))
  ],
);

export const insertContentChunkSchema = createInsertSchema(contentChunks).pick({
  duplikaId: true,
  sourceType: true,
  sourceUrl: true,
  chunkText: true,
});

export type InsertContentChunk = z.infer<typeof insertContentChunkSchema>;
export type ContentChunk = typeof contentChunks.$inferSelect;
