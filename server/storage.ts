import { db } from "./db";
import {
  items,
  type CreateItemRequest,
  type UpdateItemRequest,
  type ItemResponse
} from "@shared/schema";
import { eq, ilike, and } from "drizzle-orm";

export interface IStorage {
  getItems(search?: string, type?: string): Promise<ItemResponse[]>;
  getItem(id: number): Promise<ItemResponse | undefined>;
  createItem(item: CreateItemRequest): Promise<ItemResponse>;
  updateItem(id: number, updates: UpdateItemRequest): Promise<ItemResponse>;
  deleteItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getItems(search?: string, type?: string): Promise<ItemResponse[]> {
    const conditions = [];
    if (search) {
      conditions.push(ilike(items.title, `%${search}%`));
    }
    if (type) {
      conditions.push(eq(items.type, type));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(items).where(and(...conditions));
    }
    return await db.select().from(items);
  }

  async getItem(id: number): Promise<ItemResponse | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(insertItem: CreateItemRequest): Promise<ItemResponse> {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }

  async updateItem(id: number, updates: UpdateItemRequest): Promise<ItemResponse> {
    const [updated] = await db.update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return updated;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }
}

export const storage = new DatabaseStorage();
