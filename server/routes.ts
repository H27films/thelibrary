import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Items API
  app.get(api.items.list.path, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const type = req.query.type as string | undefined;
      const itemsList = await storage.getItems(search, type);
      res.json(itemsList);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get(api.items.get.path, async (req, res) => {
    try {
      const item = await storage.getItem(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put(api.items.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existingItem = await storage.getItem(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      const input = api.items.update.input.parse(req.body);
      const item = await storage.updateItem(id, input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete(api.items.delete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existingItem = await storage.getItem(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      await storage.deleteItem(id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Seed data on startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingItems = await storage.getItems();
    if (existingItems.length === 0) {
      await storage.createItem({ 
        title: "The Catcher in the Rye", 
        type: "book",
        metadata: { author: "J.D. Salinger", genre: "Fiction", year: 1951 }
      });
      await storage.createItem({ 
        title: "2001: A Space Odyssey", 
        type: "film",
        metadata: { director: "Stanley Kubrick", genre: "Sci-Fi", year: 1968 }
      });
      await storage.createItem({ 
        title: "Dieter Rams", 
        type: "person",
        metadata: { profession: "Industrial Designer", nationality: "German" }
      });
      await storage.createItem({ 
        title: "Dune", 
        type: "book",
        metadata: { author: "Frank Herbert", genre: "Sci-Fi", year: 1965 }
      });
      await storage.createItem({ 
        title: "Blade Runner 2049", 
        type: "film",
        metadata: { director: "Denis Villeneuve", genre: "Sci-Fi", year: 2017 }
      });
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
