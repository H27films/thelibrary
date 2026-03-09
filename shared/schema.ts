import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'book', 'film', 'person'
  metadata: jsonb("metadata").default({}), // e.g., { director: "...", author: "...", genre: "..." }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type CreateItemRequest = InsertItem;
export type UpdateItemRequest = Partial<InsertItem>;
export type ItemResponse = Item;
export type ItemsListResponse = Item[];
