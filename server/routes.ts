import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { 
  insertDuplikaSchema, 
  insertFactSchema,
  insertQaPairSchema,
  insertTopicToAvoidSchema,
  insertShareableLinkSchema,
  insertKeywordResponseSchema,
  insertConversationSchema,
  insertMessageSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ==================== DUPLIKAS ====================
  
  // Create a new Duplika
  app.post("/api/duplikas", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertDuplikaSchema.parse({ ...req.body, userId });
      const duplika = await storage.createDuplika(data);
      res.status(201).json(duplika);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Get user's Duplikas
  app.get("/api/duplikas/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplikas = await storage.getDuplikasByUserId(userId);
      res.json(duplikas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get public Duplikas
  app.get("/api/duplikas/public", async (_req, res) => {
    try {
      const duplikas = await storage.getPublicDuplikas();
      res.json(duplikas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get Duplika by ID
  app.get("/api/duplikas/:id", async (req, res) => {
    try {
      const duplika = await storage.getDuplika(req.params.id);
      if (!duplika) {
        return res.status(404).json({ message: "Duplika not found" });
      }
      res.json(duplika);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get Duplika by handle
  app.get("/api/duplikas/handle/:handle", async (req, res) => {
    try {
      const duplika = await storage.getDuplikaByHandle(req.params.handle);
      if (!duplika) {
        return res.status(404).json({ message: "Duplika not found" });
      }
      res.json(duplika);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update Duplika
  app.patch("/api/duplikas/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika) {
        return res.status(404).json({ message: "Duplika not found" });
      }
      
      if (duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updated = await storage.updateDuplika(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete Duplika
  app.delete("/api/duplikas/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika) {
        return res.status(404).json({ message: "Duplika not found" });
      }
      
      if (duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteDuplika(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ==================== CONVERSATIONS ====================
  
  // Create a new conversation
  app.post("/api/conversations", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || null;
      const data = insertConversationSchema.parse({ ...req.body, userId });
      const conversation = await storage.createConversation(data);
      res.status(201).json(conversation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Get conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get conversations by Duplika ID
  app.get("/api/duplikas/:id/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByDuplikaId(req.params.id);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ==================== MESSAGES ====================
  
  // Get messages by conversation ID
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // ==================== FACTS ====================
  
  // Get facts by Duplika ID
  app.get("/api/duplikas/:id/facts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const facts = await storage.getFactsByDuplikaId(req.params.id);
      res.json(facts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a fact
  app.post("/api/facts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.body.duplikaId);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const data = insertFactSchema.parse(req.body);
      const fact = await storage.createFact(data);
      res.status(201).json(fact);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update a fact
  app.patch("/api/facts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const fact = await storage.updateFact(req.params.id, req.body.content);
      res.json(fact);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a fact
  app.delete("/api/facts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFact(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ==================== Q&A PAIRS ====================
  
  // Get Q&A pairs by Duplika ID
  app.get("/api/duplikas/:id/qa-pairs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const qaPairs = await storage.getQaPairsByDuplikaId(req.params.id);
      res.json(qaPairs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a Q&A pair
  app.post("/api/qa-pairs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.body.duplikaId);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const data = insertQaPairSchema.parse(req.body);
      const qaPair = await storage.createQaPair(data);
      res.status(201).json(qaPair);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update a Q&A pair
  app.patch("/api/qa-pairs/:id", isAuthenticated, async (req, res) => {
    try {
      const qaPair = await storage.updateQaPair(req.params.id, req.body);
      res.json(qaPair);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a Q&A pair
  app.delete("/api/qa-pairs/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteQaPair(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ==================== TOPICS TO AVOID ====================
  
  // Get topics by Duplika ID
  app.get("/api/duplikas/:id/topics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const topics = await storage.getTopicsByDuplikaId(req.params.id);
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a topic
  app.post("/api/topics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.body.duplikaId);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const data = insertTopicToAvoidSchema.parse(req.body);
      const topic = await storage.createTopic(data);
      res.status(201).json(topic);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a topic
  app.delete("/api/topics/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTopic(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ==================== SHAREABLE LINKS ====================
  
  // Get links by Duplika ID
  app.get("/api/duplikas/:id/links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const links = await storage.getLinksByDuplikaId(req.params.id);
      res.json(links);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a link
  app.post("/api/links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.body.duplikaId);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const data = insertShareableLinkSchema.parse(req.body);
      const link = await storage.createLink(data);
      res.status(201).json(link);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update a link
  app.patch("/api/links/:id", isAuthenticated, async (req, res) => {
    try {
      const link = await storage.updateLink(req.params.id, req.body);
      res.json(link);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a link
  app.delete("/api/links/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLink(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // ==================== KEYWORD RESPONSES ====================
  
  // Get keywords by Duplika ID
  app.get("/api/duplikas/:id/keywords", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.params.id);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const keywords = await storage.getKeywordsByDuplikaId(req.params.id);
      res.json(keywords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a keyword
  app.post("/api/keywords", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const duplika = await storage.getDuplika(req.body.duplikaId);
      
      if (!duplika || duplika.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const data = insertKeywordResponseSchema.parse(req.body);
      const keyword = await storage.createKeyword(data);
      res.status(201).json(keyword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update a keyword
  app.patch("/api/keywords/:id", isAuthenticated, async (req, res) => {
    try {
      const keyword = await storage.updateKeyword(req.params.id, req.body);
      res.json(keyword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a keyword
  app.delete("/api/keywords/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteKeyword(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
