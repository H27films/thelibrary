const TMDB_KEY = "2428c93b0a5eda8535766a3dc580e353";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

export const posterUrl = (path: string | null, size = "w342") =>
  path ? `${IMG}/${size}${path}` : "";

export const profileUrl = (path: string | null, size = "w185") =>
  path ? `${IMG}/${size}${path}` : "";

export async function searchMulti(query: string) {
  const res = await fetch(
    `${BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
  );
  const data = await res.json();
  return (data.results || []).filter((r: any) => r.media_type === "movie" || r.media_type === "tv");
}

export async function searchPeople(query: string) {
  const res = await fetch(
    `${BASE}/search/person?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return data.results || [];
}

export async function getMovieDetails(id: number) {
  const res = await fetch(
    `${BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=credits`
  );
  return res.json();
}

export async function getTVDetails(id: number) {
  const res = await fetch(
    `${BASE}/tv/${id}?api_key=${TMDB_KEY}&append_to_response=credits`
  );
  return res.json();
}
