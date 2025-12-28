import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Duplikas table - AI personas created by users
export const duplikas = pgTable("duplikas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  handle: text("handle").notNull().unique(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
  firstMessage: text("first_message").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  conversationCount: integer("conversation_count").notNull().default(0),
  followerCount: integer("follower_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDuplikaSchema = createInsertSchema(duplikas).omit({ 
  id: true, 
  conversationCount: true, 
  followerCount: true,
  createdAt: true 
});
export type InsertDuplika = z.infer<typeof insertDuplikaSchema>;
export type Duplika = typeof duplikas.$inferSelect;

// Conversations table - tracks individual chat sessions
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }), // null for anonymous users
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true 
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table - stores chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  isFromDuplika: boolean("is_from_duplika").notNull(),
  content: text("content").notNull(),
  fanMode: boolean("fan_mode").notNull().default(false), // simple vs rich response
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Facts table - structured knowledge for AI responses
export const facts = pgTable("facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFactSchema = createInsertSchema(facts).omit({ id: true, createdAt: true });
export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof facts.$inferSelect;

// Q&A pairs table - predefined question/answer pairs
export const qaPairs = pgTable("qa_pairs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQaPairSchema = createInsertSchema(qaPairs).omit({ id: true, createdAt: true });
export type InsertQaPair = z.infer<typeof insertQaPairSchema>;
export type QaPair = typeof qaPairs.$inferSelect;

// Topics to avoid table
export const topicsToAvoid = pgTable("topics_to_avoid", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTopicToAvoidSchema = createInsertSchema(topicsToAvoid).omit({ id: true, createdAt: true });
export type InsertTopicToAvoid = z.infer<typeof insertTopicToAvoidSchema>;
export type TopicToAvoid = typeof topicsToAvoid.$inferSelect;

// Shareable links table
export const shareableLinks = pgTable("shareable_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertShareableLinkSchema = createInsertSchema(shareableLinks).omit({ id: true, createdAt: true });
export type InsertShareableLink = z.infer<typeof insertShareableLinkSchema>;
export type ShareableLink = typeof shareableLinks.$inferSelect;

// Keyword responses table
export const keywordResponses = pgTable("keyword_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKeywordResponseSchema = createInsertSchema(keywordResponses).omit({ id: true, createdAt: true });
export type InsertKeywordResponse = z.infer<typeof insertKeywordResponseSchema>;
export type KeywordResponse = typeof keywordResponses.$inferSelect;
