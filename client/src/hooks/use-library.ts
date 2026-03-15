import { useState, useEffect, useCallback } from "react";

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

function useLocalStorage<T>(key: string, initial: T[]) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [key, items]);

  const add = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i: any) => i.id !== id));
  }, []);

  return { items, add, remove };
}

export function useMovies() {
  return useLocalStorage<MovieItem>("library_movies", []);
}

export function useBooks() {
  return useLocalStorage<BookItem>("library_books", []);
}

export function usePeople() {
  return useLocalStorage<PersonItem>("library_people", []);
}
