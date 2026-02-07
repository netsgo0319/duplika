import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import authRoutes from "./routes/auth";
import duplikasRoutes from "./routes/duplikas";
import publicRoutes from "./routes/public";
import chatRoutes from "./routes/chat";
import contentSourceRoutes from "./routes/content-sources";
import crawlRoutes from "./routes/crawl";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (session + passport)
  setupAuth(app);

  // Auth routes
  app.use("/api/auth", authRoutes);

  // Duplika CRUD + sub-resource routes
  app.use("/api/duplikas", duplikasRoutes);

  // Content source routes (mounted under /api/duplikas for ownership checks)
  app.use("/api/duplikas", contentSourceRoutes);

  // Crawl trigger, status, and knowledge routes
  app.use("/api/duplikas", crawlRoutes);

  // Chat routes
  app.use("/api/chat", chatRoutes);

  // Public profile routes
  app.use("/api/public", publicRoutes);

  return httpServer;
}
