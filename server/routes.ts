import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDuplikaSchema, insertFactSchema, insertQaPairSchema, insertTopicSchema, insertShareableLinkSchema, insertKeywordResponseSchema, insertMessageSchema, insertContentItemSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Duplikas
  app.get("/api/duplikas", async (req, res) => {
    try {
      const duplikas = await storage.getAllDuplikas();
      res.json(duplikas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch duplikas" });
    }
  });

  app.get("/api/duplikas/public", async (req, res) => {
    try {
      const duplikas = await storage.getPublicDuplikas();
      res.json(duplikas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public duplikas" });
    }
  });

  app.get("/api/duplikas/:id", async (req, res) => {
    try {
      const duplika = await storage.getDuplikaById(req.params.id);
      if (!duplika) {
        return res.status(404).json({ error: "Duplika not found" });
      }
      res.json(duplika);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch duplika" });
    }
  });

  app.get("/api/duplikas/handle/:handle", async (req, res) => {
    try {
      const duplika = await storage.getDuplikaByHandle(req.params.handle);
      if (!duplika) {
        return res.status(404).json({ error: "Duplika not found" });
      }
      res.json(duplika);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch duplika" });
    }
  });

  app.post("/api/duplikas", async (req, res) => {
    try {
      const validated = insertDuplikaSchema.parse(req.body);
      const duplika = await storage.createDuplika(validated);
      res.status(201).json(duplika);
    } catch (error) {
      res.status(400).json({ error: "Invalid duplika data" });
    }
  });

  app.patch("/api/duplikas/:id", async (req, res) => {
    try {
      const duplika = await storage.updateDuplika(req.params.id, req.body);
      if (!duplika) {
        return res.status(404).json({ error: "Duplika not found" });
      }
      res.json(duplika);
    } catch (error) {
      res.status(400).json({ error: "Failed to update duplika" });
    }
  });

  app.delete("/api/duplikas/:id", async (req, res) => {
    try {
      await storage.deleteDuplika(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete duplika" });
    }
  });

  // Facts
  app.get("/api/duplikas/:duplikaId/facts", async (req, res) => {
    try {
      const facts = await storage.getFactsByDuplikaId(req.params.duplikaId);
      res.json(facts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch facts" });
    }
  });

  app.post("/api/duplikas/:duplikaId/facts", async (req, res) => {
    try {
      const validated = insertFactSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const fact = await storage.createFact(validated);
      res.status(201).json(fact);
    } catch (error) {
      res.status(400).json({ error: "Invalid fact data" });
    }
  });

  app.patch("/api/facts/:id", async (req, res) => {
    try {
      const fact = await storage.updateFact(req.params.id, req.body.text);
      if (!fact) {
        return res.status(404).json({ error: "Fact not found" });
      }
      res.json(fact);
    } catch (error) {
      res.status(400).json({ error: "Failed to update fact" });
    }
  });

  app.delete("/api/facts/:id", async (req, res) => {
    try {
      await storage.deleteFact(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete fact" });
    }
  });

  // Q&A Pairs
  app.get("/api/duplikas/:duplikaId/qa-pairs", async (req, res) => {
    try {
      const qaPairs = await storage.getQaPairsByDuplikaId(req.params.duplikaId);
      res.json(qaPairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Q&A pairs" });
    }
  });

  app.post("/api/duplikas/:duplikaId/qa-pairs", async (req, res) => {
    try {
      const validated = insertQaPairSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const qaPair = await storage.createQaPair(validated);
      res.status(201).json(qaPair);
    } catch (error) {
      res.status(400).json({ error: "Invalid Q&A pair data" });
    }
  });

  app.patch("/api/qa-pairs/:id", async (req, res) => {
    try {
      const qaPair = await storage.updateQaPair(req.params.id, req.body.question, req.body.answer);
      if (!qaPair) {
        return res.status(404).json({ error: "Q&A pair not found" });
      }
      res.json(qaPair);
    } catch (error) {
      res.status(400).json({ error: "Failed to update Q&A pair" });
    }
  });

  app.delete("/api/qa-pairs/:id", async (req, res) => {
    try {
      await storage.deleteQaPair(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete Q&A pair" });
    }
  });

  // Topics to Avoid
  app.get("/api/duplikas/:duplikaId/topics", async (req, res) => {
    try {
      const topics = await storage.getTopicsByDuplikaId(req.params.duplikaId);
      res.json(topics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  app.post("/api/duplikas/:duplikaId/topics", async (req, res) => {
    try {
      const validated = insertTopicSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const topic = await storage.createTopic(validated);
      res.status(201).json(topic);
    } catch (error) {
      res.status(400).json({ error: "Invalid topic data" });
    }
  });

  app.delete("/api/topics/:id", async (req, res) => {
    try {
      await storage.deleteTopic(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete topic" });
    }
  });

  // Shareable Links
  app.get("/api/duplikas/:duplikaId/links", async (req, res) => {
    try {
      const links = await storage.getLinksByDuplikaId(req.params.duplikaId);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.post("/api/duplikas/:duplikaId/links", async (req, res) => {
    try {
      const validated = insertShareableLinkSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const link = await storage.createLink(validated);
      res.status(201).json(link);
    } catch (error) {
      res.status(400).json({ error: "Invalid link data" });
    }
  });

  app.delete("/api/links/:id", async (req, res) => {
    try {
      await storage.deleteLink(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  // Keyword Responses
  app.get("/api/duplikas/:duplikaId/keyword-responses", async (req, res) => {
    try {
      const responses = await storage.getKeywordResponsesByDuplikaId(req.params.duplikaId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch keyword responses" });
    }
  });

  app.post("/api/duplikas/:duplikaId/keyword-responses", async (req, res) => {
    try {
      const validated = insertKeywordResponseSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const response = await storage.createKeywordResponse(validated);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ error: "Invalid keyword response data" });
    }
  });

  app.patch("/api/keyword-responses/:id", async (req, res) => {
    try {
      const response = await storage.updateKeywordResponse(req.params.id, req.body.keywords, req.body.response);
      if (!response) {
        return res.status(404).json({ error: "Keyword response not found" });
      }
      res.json(response);
    } catch (error) {
      res.status(400).json({ error: "Failed to update keyword response" });
    }
  });

  app.delete("/api/keyword-responses/:id", async (req, res) => {
    try {
      await storage.deleteKeywordResponse(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete keyword response" });
    }
  });

  // Messages
  app.get("/api/duplikas/:duplikaId/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getMessagesByDuplikaId(req.params.duplikaId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/duplikas/:duplikaId/messages", async (req, res) => {
    try {
      const validated = insertMessageSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const message = await storage.createMessage(validated);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Content Items
  app.get("/api/duplikas/:duplikaId/content", async (req, res) => {
    try {
      const content = await storage.getContentItemsByDuplikaId(req.params.duplikaId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content items" });
    }
  });

  app.post("/api/duplikas/:duplikaId/content", async (req, res) => {
    try {
      const validated = insertContentItemSchema.parse({ ...req.body, duplikaId: req.params.duplikaId });
      const item = await storage.createContentItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid content item data" });
    }
  });

  return httpServer;
}
