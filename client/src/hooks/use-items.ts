import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ItemInput, type ItemUpdateInput } from "@shared/routes";

// Utility to parse JSON responses with error logging
function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useItems(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: [api.items.list.path, params?.search, params?.type],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append("search", params.search);
      if (params?.type && params.type !== "All") searchParams.append("type", params.type);
      
      const url = `${api.items.list.path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      return parseWithLogging(api.items.list.responses[200], data, "items.list");
    },
  });
}

export function useItem(id: number | null) {
  return useQuery({
    queryKey: [api.items.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.items.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item");
      
      const data = await res.json();
      return parseWithLogging(api.items.get.responses[200], data, "items.get");
    },
    enabled: id !== null,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ItemInput) => {
      const validated = api.items.create.input.parse(data);
      const res = await fetch(api.items.create.path, {
        method: api.items.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.items.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create item");
      }
      return parseWithLogging(api.items.create.responses[201], await res.json(), "items.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.items.list.path] }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & ItemUpdateInput) => {
      const validated = api.items.update.input.parse(updates);
      const url = buildUrl(api.items.update.path, { id });
      const res = await fetch(url, {
        method: api.items.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.items.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Item not found");
        throw new Error("Failed to update item");
      }
      return parseWithLogging(api.items.update.responses[200], await res.json(), "items.update");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.items.list.path] }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.items.delete.path, { id });
      const res = await fetch(url, { 
        method: api.items.delete.method, 
        credentials: "include" 
      });
      
      if (res.status === 404) throw new Error("Item not found");
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.items.list.path] }),
  });
}
