import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface MovieItem {
  id: string;
  title: string;
  year: string;
  director: string;
  cast: string[];
  genre: string;
  posterUrl: string;
  tmdbId: number;
  type: "movie" | "tv";
  overview: string;
  dateAdded: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  coverUrl: string;
  description: string;
  googleBooksId: string;
  dateAdded: string;
}

export interface PersonItem {
  id: string;
  name: string;
  photoUrl: string;
  knownFor: string;
  knownForTitles: string[];
  tmdbId: number;
  dateAdded: string;
}

function toMovieItem(item: any): MovieItem {
  const m = item.metadata || {};
  return {
    id: String(item.id),
    title: item.title,
    year: m.year || "",
    director: m.director || "",
    cast: m.cast || [],
    genre: m.genre || "",
    posterUrl: m.posterUrl || "",
    tmdbId: m.tmdbId || 0,
    type: m.mediaType || "movie",
    overview: m.overview || "",
    dateAdded: item.createdAt || new Date().toISOString(),
  };
}

function toBookItem(item: any): BookItem {
  const m = item.metadata || {};
  return {
    id: String(item.id),
    title: item.title,
    author: m.author || "",
    year: m.year || "",
    genre: m.genre || "",
    coverUrl: m.coverUrl || "",
    description: m.description || "",
    googleBooksId: m.googleBooksId || "",
    dateAdded: item.createdAt || new Date().toISOString(),
  };
}

function toPersonItem(item: any): PersonItem {
  const m = item.metadata || {};
  return {
    id: String(item.id),
    name: item.title,
    photoUrl: m.photoUrl || "",
    knownFor: m.knownFor || "",
    knownForTitles: m.knownForTitles || [],
    tmdbId: m.tmdbId || 0,
    dateAdded: item.createdAt || new Date().toISOString(),
  };
}

export function useMovies() {
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["/api/items", "film"],
    queryFn: async () => {
      const res = await fetch("/api/items?type=film");
      if (!res.ok) throw new Error("Failed to fetch films");
      const data = await res.json();
      return data.map(toMovieItem);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (movie: MovieItem) => {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: movie.title,
          type: "film",
          metadata: {
            year: movie.year,
            director: movie.director,
            cast: movie.cast,
            genre: movie.genre,
            posterUrl: movie.posterUrl,
            tmdbId: movie.tmdbId,
            mediaType: movie.type,
            overview: movie.overview,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save film");
      return res.json();
    },
    onMutate: async (movie: MovieItem) => {
      await queryClient.cancelQueries({ queryKey: ["/api/items", "film"] });
      const previous = queryClient.getQueryData(["/api/items", "film"]);
      queryClient.setQueryData(["/api/items", "film"], (old: MovieItem[] = []) => [movie, ...old]);
      return { previous };
    },
    onError: (_err, _movie, context: any) => {
      queryClient.setQueryData(["/api/items", "film"], context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/api/items", "film"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete film");
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/items", "film"] });
      const previous = queryClient.getQueryData(["/api/items", "film"]);
      queryClient.setQueryData(["/api/items", "film"], (old: MovieItem[] = []) => old.filter(m => m.id !== id));
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      queryClient.setQueryData(["/api/items", "film"], context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/api/items", "film"] }),
  });

  return {
    items: data as MovieItem[],
    add: (movie: MovieItem) => createMutation.mutate(movie),
    remove: (id: string) => deleteMutation.mutate(id),
  };
}

export function useBooks() {
  const queryClient = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["/api/items", "book"],
    queryFn: async () => {
      const res = await fetch("/api/items?type=book");
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      return data.map(toBookItem);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (book: BookItem) => {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          type: "book",
          metadata: {
            author: book.author,
            year: book.year,
            genre: book.genre,
            coverUrl: book.coverUrl,
            description: book.description,
            googleBooksId: book.googleBooksId,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save book");
      return res.json();
    },
    onMutate: async (book: BookItem) => {
      await queryClient.cancelQueries({ queryKey: ["/api/items", "book"] });
      const previous = queryClient.getQueryData(["/api/items", "book"]);
      queryClient.setQueryData(["/api/items", "book"], (old: BookItem[] = []) => [book, ...old]);
      return { previous };
    },
    onError: (_err, _book, context: any) => {
      queryClient.setQueryData(["/api/items", "book"], context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["/api/items", "book"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: st
