import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Loader2, Link } from "lucide-react";
import { useMovies, type MovieItem } from "@/hooks/use-library";
import { searchMulti, getMovieDetails, getTVDetails, posterUrl } from "@/lib/tmdb";
import { DetailView } from "@/components/detail-view";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  media_type: "movie" | "tv";
  overview: string;
}

function parseTmdbUrl(url: string): { type: "movie" | "tv"; id: number } | null {
  const match = url.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
  if (!match) return null;
  return { type: match[1] as "movie" | "tv", id: parseInt(match[2], 10) };
}

function RatingDisplay({ rating }: { rating?: number }) {
  if (rating === undefined || rating === null) return null;
  return (
    <span className="text-[11px] tracking-wide text-[#1A1A1A]/50 font-light">
      {rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}
    </span>
  );
}

export default function Movies() {
  const { items, add, remove, updateRating } = useMovies();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "genre" | "director">("all");
  const [selectedItem, setSelectedItem] = useState<MovieItem | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMulti(query);
        setResults(res);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [query]);

  const buildAndSave = async (mediaType: "movie" | "tv", id: number, overrides?: Partial<SearchResult>) => {
    let detail: any;
    let director = "";
    let cast: string[] = [];

    if (mediaType === "movie") {
      detail = await getMovieDetails(id);
      director = detail.credits?.crew?.find((c: any) => c.job === "Director")?.name || "";
      cast = (detail.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
    } else {
      detail = await getTVDetails(id);
      director = (detail.created_by || []).map((c: any) => c.name).join(", ");
      cast = (detail.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
    }

    const year = mediaType === "movie"
      ? (detail.release_date || "").slice(0, 4)
      : (detail.first_air_date || "").slice(0, 4);

    const genre = (detail.genres || []).map((g: any) => g.name).join(", ");

    const item: MovieItem = {
      id: `${mediaType}-${id}-${Date.now()}`,
      title: detail.title || detail.name || overrides?.title || "",
      year,
      director,
      cast,
      genre,
      posterUrl: posterUrl(detail.poster_path || overrides?.poster_path || null),
      tmdbId: id,
      type: mediaType,
      overview: detail.overview || "",
      dateAdded: new Date().toISOString(),
    };
    add(item);
  };

  const handleAdd = async (result: SearchResult) => {
    setLoading(true);
    try {
      await buildAndSave(result.media_type, result.id, result);
      setSearchOpen(false);
      setQuery("");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlAdd = async () => {
    setUrlError("");
    const parsed = parseTmdbUrl(urlInput.trim());
    if (!parsed) {
      setUrlError("Paste a valid TMDB URL, e.g. themoviedb.org/movie/12345");
      return;
    }
    setLoading(true);
    try {
      await buildAndSave(parsed.type, parsed.id);
      setSearchOpen(false);
      setUrlMode(false);
      setUrlInput("");
    } catch {
      setUrlError("Couldn't fetch that title. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setUrlMode(false);
    setUrlInput("");
    setUrlError("");
  };

  // Get unique genres and directors for filter suggestions
  const allGenres = [...new Set(items.flatMap(i => i.genre.split(", ").filter(Boolean)))].sort();
  const allDirectors = [...new Set(items.map(i => i.director).filter(Boolean))].sort();

  const filtered = items.filter((i) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    if (filterType === "genre") return i.genre.toLowerCase().includes(q);
    if (filterType === "director") return i.director.toLowerCase().includes(q);
    return i.title.toLowerCase().includes(q) ||
      i.genre.toLowerCase().includes(q) ||
      i.director.toLowerCase().includes(q);
  });

  // sync selectedItem when items update (e.g. after rating)
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find(i => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [items]);

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE]">
      {/* Header */}
      <div className="px-5 pt-14 pb-0">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-[42px] font-light text-[#1A1A1A] leading-none tracking-tight">Films & TV</h1>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 font-medium">{items.length}</span>
        </div>
        <div className="h-px bg-[#1A1A1A]/10 mt-5" />
      </div>

      {/* Filter + Add */}
      <div className="px-5 py-3.5 border-b border-[#1A1A1A]/8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <Search className="w-3 h-3 text-[#1A1A1A]/25 flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Filter by title, genre, director…"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="bg-transparent text-[12px] tracking-wide placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] w-full"
            />
          </div>
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
            className="flex items-center text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        {/* Filter type pills */}
        {filterQuery.length > 0 && (
          <div className="flex gap-2 mt-2.5">
            {(["all", "genre", "director"] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border transition-colors ${
                  filterType === type
                    ? "border-[#1A1A1A] text-[#1A1A1A]"
                    : "border-[#1A1A1A]/20 text-[#1A1A1A]/35"
                }`}
              >
                {type === "all" ? "All" : type === "genre" ? "Genre" : "Director"}
              </button>
            ))}
          </div>
        )}
        {/* Genre suggestions */}
        {filterType === "genre" && filterQuery.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {allGenres.slice(0, 8).map(genre => (
              <button
                key={genre}
                onClick={() => setFilterQuery(genre)}
                className="text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border border-[#1A1A1A]/20 text-[#1A1A1A]/40 hover:border-[#1A1A1A]/50 hover:text-[#1A1A1A]/70 transition-colors"
              >
                {genre}
              </button>
            ))}
          </div>
        )}
        {/* Director suggestions */}
        {filterType === "director" && filterQuery.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {allDirectors.slice(0, 6).map(director => (
              <button
                key={director}
                onClick={() => setFilterQuery(director)}
                className="text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 border border-[#1A1A1A]/20 text-[#1A1A1A]/40 hover:border-[#1A1A1A]/50 hover:text-[#1A1A1A]/70 transition-colors"
              >
                {director}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-nav">
        {filtered.length === 0 ? (
          <div className="px-5 pt-14">
            <p className="font-serif text-[22px] font-light italic text-[#1A1A1A]/20 leading-snug">
              Your collection<br />is waiting.
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 px-5 py-5 border-b border-[#1A1A1A]/7 cursor-pointer active:bg-[#1A1A1A]/[0.02]"
                onClick={() => setSelectedItem(item)}
              >
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} className="w-12 h-[72px] object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-[72px] bg-[#1A1A1A]/6 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-serif text-[22px] font-light text-[#1A1A1A] leading-tight">{item.title}</p>
                  <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1.5 font-light">
                    {[item.year, item.director].filter(Boolean).join("  ·  ")}
                  </p>
                  {item.genre && (
                    <p className="text-[11px] tracking-wide text-[#1A1A1A]/25 mt-0.5 font-light">{item.genre}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 pt-0.5 flex-shrink-0">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/25">
                    {item.type === "tv" ? "TV" : "Film"}
                  </span>
                  <RatingDisplay rating={item.rating} />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#F5F2EE] flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pt-14 pb-4 border-b border-[#1A1A1A]/10">
              <AnimatePresence mode="wait" initial={false}>
                {!urlMode ? (
                  <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-[#1A1A1A]/30 flex-shrink-0" strokeWidth={1.5} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search films & TV…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 bg-transparent text-[18px] font-light placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A]"
                    />
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
                    ) : (
                      <button onClick={closeSearch} className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/35 font-medium">Cancel</button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                    <Link className="w-4 h-4 text-[#1A1A1A]/30 flex-shrink-0" strokeWidth={1.5} />
                    <input
                      ref={urlInputRef}
                      type="url"
                      placeholder="themoviedb.org/movie/…"
                      value={urlInput}
                      onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleUrlAdd()}
                      className="flex-1 bg-transparent text-[16px] font-light placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A]"
                    />
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
                    ) : (
                      <button onClick={handleUrlAdd} className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-semibold">Fetch</button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {urlMode && (
                <div className="px-5 pt-6">
                  {urlError && <p className="text-[12px] text-[#8B2635] mb-4">{urlError}</p>}
                  <p className="text-[12px] text-[#1A1A1A]/35 leading-relaxed">
                    Go to <span className="underline underline-offset-2">themoviedb.org</span>, find the film or TV show, then paste the page URL here.
                  </p>
                  <button onClick={() => { setUrlMode(false); setTimeout(() => inputRef.current?.focus(), 50); }} className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/35 font-medium">← Back to search</button>
                </div>
              )}
              {!urlMode && (
                <>
                  {loading && <div className="flex justify-center py-14"><Loader2 className="w-5 h-5 animate-spin text-[#1A1A1A]/30" strokeWidth={1.5} /></div>}
                  {!loading && results.map((r) => (
                    <button key={r.id} className="w-full flex items-center gap-4 px-5 py-4 border-b border-[#1A1A1A]/7 text-left active:bg-[#1A1A1A]/[0.02]" onClick={() => handleAdd(r)}>
                      {r.poster_path ? (
                        <img src={posterUrl(r.poster_path, "w92")} alt="" className="w-10 h-[60px] object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-[60px] bg-[#1A1A1A]/6 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[20px] font-light text-[#1A1A1A] leading-tight">{r.title || r.name}</p>
                        <p className="text-[11px] text-[#1A1A1A]/35 mt-1 tracking-wide">
                          {(r.release_date || r.first_air_date || "").slice(0, 4)}
                          {"  ·  "}
                          <span className="uppercase text-[9px] tracking-[0.15em]">{r.media_type === "tv" ? "TV" : "Film"}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                  {!loading && query.trim().length > 1 && (
                    <div className="px-5 pt-6 pb-4">
                      <button onClick={() => { setUrlMode(true); setTimeout(() => urlInputRef.current?.focus(), 50); }} className="flex items-center gap-2 text-[11px] text-[#1A1A1A]/35 hover:text-[#1A1A1A]/60 transition-colors">
                        <Link className="w-3 h-3" strokeWidth={1.5} />
                        Can't find it? Paste a TMDB URL instead
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <DetailView
            item={selectedItem}
            type="movie"
            onClose={() => setSelectedItem(null)}
            onDelete={remove}
            onRatingChange={(id, rating) => updateRating(id, rating)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
