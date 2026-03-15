import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Loader2, Film } from "lucide-react";
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

export default function Movies() {
  const { items, add, remove } = useMovies();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MovieItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleAdd = async (result: SearchResult) => {
    setLoading(true);
    try {
      let detail: any;
      let director = "";
      let cast: string[] = [];

      if (result.media_type === "movie") {
        detail = await getMovieDetails(result.id);
        director = detail.credits?.crew?.find((c: any) => c.job === "Director")?.name || "";
        cast = (detail.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
      } else {
        detail = await getTVDetails(result.id);
        director = (detail.created_by || []).map((c: any) => c.name).join(", ");
        cast = (detail.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
      }

      const year =
        result.media_type === "movie"
          ? result.release_date?.slice(0, 4) || ""
          : result.first_air_date?.slice(0, 4) || "";

      const item: MovieItem = {
        id: `${result.media_type}-${result.id}-${Date.now()}`,
        title: result.title || result.name || "",
        year,
        director,
        cast,
        posterUrl: posterUrl(result.poster_path),
        tmdbId: result.id,
        type: result.media_type,
        overview: result.overview || detail.overview || "",
        dateAdded: new Date().toISOString(),
      };
      add(item);
      setSearchOpen(false);
      setQuery("");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((i) =>
    filterQuery ? i.title.toLowerCase().includes(filterQuery.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE]">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-end justify-between mb-1">
          <h1 className="font-serif text-[28px] font-medium text-[#1A1A1A] leading-none">Films & TV</h1>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-0.5">{items.length}</span>
        </div>
        <div className="h-[1px] bg-black/8 mt-4" />
      </div>

      {/* Filter + Add */}
      <div className="px-5 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1A1A1A]/30" strokeWidth={2} />
          <input
            type="text"
            placeholder="Filter collection"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-transparent pl-5 text-[13px] placeholder:text-[#1A1A1A]/25 focus:outline-none text-[#1A1A1A]"
          />
        </div>
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#8B2635] font-semibold"
          data-testid="button-add-film"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Add
        </button>
      </div>
      <div className="h-[1px] bg-black/8 mx-5" />

      {/* List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-nav">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#1A1A1A]/20">
            <Film className="w-8 h-8 mb-3" strokeWidth={1} />
            <p className="text-[13px] font-serif italic">Nothing saved yet</p>
          </div>
        ) : (
          <motion.ul>
            {filtered.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4 px-5 py-4 border-b border-black/5 cursor-pointer active:bg-black/[0.02]"
                onClick={() => setSelectedItem(item)}
                data-testid={`item-film-${item.id}`}
              >
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} className="w-11 h-16 object-cover flex-shrink-0 bg-black/5" />
                ) : (
                  <div className="w-11 h-16 bg-black/5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[15px] font-serif font-medium text-[#1A1A1A] leading-snug truncate">{item.title}</p>
                  <p className="text-[11px] text-[#1A1A1A]/40 mt-0.5">{item.year}{item.director ? ` · ${item.director}` : ""}</p>
                  {item.cast.length > 0 && (
                    <p className="text-[11px] text-[#1A1A1A]/40 mt-0.5 truncate">{item.cast.slice(0, 3).join(", ")}</p>
                  )}
                  <span className="inline-block mt-1.5 text-[9px] uppercase tracking-widest text-[#8B2635]/70">
                    {item.type === "tv" ? "TV" : "Film"}
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#F5F2EE] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pt-14 pb-3 flex items-center gap-3 border-b border-black/8">
              <Search className="w-4 h-4 text-[#1A1A1A]/40 flex-shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search films & TV..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-[16px] placeholder:text-[#1A1A1A]/25 focus:outline-none text-[#1A1A1A]"
                data-testid="input-search-film"
              />
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]/30" strokeWidth={1.5} />
              ) : (
                <button
                  onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); }}
                  className="text-[11px] uppercase tracking-widest text-[#1A1A1A]/40"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {loading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-[#8B2635]" strokeWidth={1.5} />
                </div>
              )}
              {!loading && results.map((r) => (
                <button
                  key={r.id}
                  className="w-full flex items-center gap-4 px-5 py-4 border-b border-black/5 text-left active:bg-black/[0.02]"
                  onClick={() => handleAdd(r)}
                  data-testid={`result-film-${r.id}`}
                >
                  {r.poster_path ? (
                    <img src={posterUrl(r.poster_path, "w92")} alt="" className="w-9 h-14 object-cover flex-shrink-0 bg-black/5" />
                  ) : (
                    <div className="w-9 h-14 bg-black/5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-serif font-medium text-[#1A1A1A] leading-snug">
                      {r.title || r.name}
                    </p>
                    <p className="text-[11px] text-[#1A1A1A]/40 mt-0.5">
                      {(r.release_date || r.first_air_date || "").slice(0, 4)}
                      {" · "}
                      <span className="uppercase text-[9px] tracking-widest">{r.media_type === "tv" ? "TV" : "Film"}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail View */}
      <AnimatePresence>
        {selectedItem && (
          <DetailView
            item={selectedItem}
            type="movie"
            onClose={() => setSelectedItem(null)}
            onDelete={remove}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
