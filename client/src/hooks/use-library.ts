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

// Helper to
