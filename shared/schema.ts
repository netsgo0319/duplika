import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for future auth, keeping minimal for now)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Duplikas (AI clones)
export const duplikas = pgTable("duplikas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  avatar: text("avatar"),
  firstMessage: text("first_message").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  conversations: integer("conversations").notNull().default(0),
  followers: integer("followers").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Facts about a Duplika
export const facts = pgTable("facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Q&A pairs for a Duplika
export const qaPairs = pgTable("qa_pairs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Topics to avoid
export const topicsToAvoid = pgTable("topics_to_avoid", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  topic: text("topic").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Shareable links
export const shareableLinks = pgTable("shareable_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // youtube, instagram, website
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Keyword responses
export const keywordResponses = pgTable("keyword_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  keywords: text("keywords").notNull(), // comma-separated
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  fanMode: boolean("fan_mode").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Content items for profile
export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  duplikaId: varchar("duplika_id").notNull().references(() => duplikas.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // image, video, article
  src: text("src").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDuplikaSchema = createInsertSchema(duplikas).omit({ id: true, createdAt: true, conversations: true, followers: true });
export const insertFactSchema = createInsertSchema(facts).omit({ id: true, createdAt: true });
export const insertQaPairSchema = createInsertSchema(qaPairs).omit({ id: true, createdAt: true });
export const insertTopicSchema = createInsertSchema(topicsToAvoid).omit({ id: true, createdAt: true });
export const insertShareableLinkSchema = createInsertSchema(shareableLinks).omit({ id: true, createdAt: true });
export const insertKeywordResponseSchema = createInsertSchema(keywordResponses).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertContentItemSchema = createInsertSchema(contentItems).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDuplika = z.infer<typeof insertDuplikaSchema>;
export type Duplika = typeof duplikas.$inferSelect;

export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof facts.$inferSelect;

export type InsertQaPair = z.infer<typeof insertQaPairSchema>;
export type QaPair = typeof qaPairs.$inferSelect;

export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topicsToAvoid.$inferSelect;

export type InsertShareableLink = z.infer<typeof insertShareableLinkSchema>;
export type ShareableLink = typeof shareableLinks.$inferSelect;

export type InsertKeywordResponse = z.infer<typeof insertKeywordResponseSchema>;
export type KeywordResponse = typeof keywordResponses.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ContentItem = typeof contentItems.$inferSelect;
