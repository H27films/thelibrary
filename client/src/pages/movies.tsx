import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, Link, Plus, Search, Check } from "lucide-react";
import { useMovies, type MovieItem } from "@/hooks/use-library";
import {
  searchMulti,
  getMovieDetails,
  getTVDetails,
  posterUrl,
} from "@/lib/tmdb";
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

interface PosterPreview {
  result: SearchResult;
  detail: any;
  director: string;
}

function parseTmdbUrl(
  url: string,
): { type: "movie" | "tv"; id: number } | null {
  const match = url.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
  if (!match) return null;
  return { type: match[1] as "movie" | "tv", id: parseInt(match[2], 10) };
}

function RatingDisplay({ rating }: { rating?: number }) {
  if (rating === undefined || rating === null) return null;
  return (
    <span className="font-serif text-[28px] font-light text-[#1A1A1A] leading-none">
      {rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}
    </span>
  );
}

// Bottom sheet preview for a search result — no auto-add
function SearchPreviewSheet({
  preview,
  alreadySaved,
  onClose,
  onAdd,
}: {
  preview: PosterPreview;
  alreadySaved: boolean;
  onClose: () => void;
  onAdd: () => Promise<void>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const { result, detail, director } = preview;
  const title = detail.title || detail.name || result.title || result.name || "";
  const year = (detail.release_date || detail.first_air_date || "").slice(0, 4);
  const posterPath = detail.poster_path || result.poster_path;
  const overview = detail.overview || result.overview || "";
  const genre = (detail.genres || []).map((g: any) => g.name).join(", ");

  const handleAdd = async () => {
    if (isAdding || alreadySaved) return;
    setIsAdding(true);
    await onAdd();
    setIsAdding(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#1A1A1A]/20" />
      <motion.div
        className="relative w-full bg-[#F5F2EE] border-t border-[#1A1A1A]/10 z-10 max-h-[70vh] overflow-y-auto hide-scrollbar"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-start gap-4 px-5 pt-6 pb-5">
          {posterPath ? (
            <img
              src={posterUrl(posterPath, "w185")}
              alt={title}
              className="w-20 h-28 object-cover flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-20 h-28 bg-[#1A1A1A]/6 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-2">
              {result.media_type === "tv" ? "Television" : "Film"}
              {year ? ` · ${year}` : ""}
            </p>
            <p className="font-serif text-[26px] font-light text-[#1A1A1A] leading-tight">
              {title}
            </p>
            {director && (
              <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1">
                {director}
              </p>
            )}
            {genre && (
              <p className="text-[11px] tracking-wide text-[#1A1A1A]/25 mt-0.5">
                {genre}
              </p>
            )}
            {overview && (
              <p className="text-[13px] font-light text-[#1A1A1A]/60 mt-3 leading-relaxed line-clamp-3">
                {overview}
              </p>
            )}
            <button
              onClick={handleAdd}
              disabled={alreadySaved || isAdding}
              className={`mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${
                alreadySaved ? "text-[#1A1A1A]/25" : "text-[#1A1A1A]"
              }`}
            >
              {alreadySaved ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={2} />
                  Saved
                </>
              ) : isAdding ? (
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
              ) : (
                <>
                  <Plus className="w-3 h-3" strokeWidth={2} />
                  Add to Library
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Movies() {
  const { items, add, remove, updateRating } = useMovies();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "genre" | "director">("all");
  const [selectedItem, setSelectedItem] = useState<MovieItem | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [posterPreview, setPosterPreview] = useState<PosterPreview | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
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

  const buildAndSave = async (
    mediaType: "movie" | "tv",
    id: number,
    overrides?: Partial<SearchResult>,
  ): Promise<MovieItem> => {
    let detail: any;
    let director = "";
    let cast: string[] = [];

    if (mediaType === "movie") {
      detail = await getMovieDetails(id);
      director =
        detail.credits?.crew?.find((c: any) => c.job === "Director")?.name || "";
      cast = (detail.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
    } else {
      detail = await getTVDetails(id);
      director = (detail.created_by || []).map((c: any) => c.name).join(", ");
      cast = (detail.credits?.cast || []).slice(0, 6).map((c: any) => c.name);
    }

    const year =
      mediaType === "movie"
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
    return item;
  };

  const handleQuickAdd = async (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingId(result.id);
    try {
      await buildAndSave(result.media_type, result.id, result);
    } finally {
      setLoadingId(null);
    }
  };

  // Click poster → show preview sheet without auto-adding
  const handlePosterClick = async (result: SearchResult) => {
    const alreadyAdded = addedIds.has(result.id);
    if (alreadyAdded) {
      const item = items.find((i) => i.tmdbId === result.id)!;
      setQuery("");
      setResults([]);
      setSelectedItem(item);
      return;
    }
    setLoadingId(result.id);
    try {
      let detail: any;
      let director = "";
      if (result.media_type === "movie") {
        detail = await getMovieDetails(result.id);
        director =
          detail.credits?.crew?.find((c: any) => c.job === "Director")?.name || "";
      } else {
        detail = await getTVDetails(result.id);
        director = (detail.created_by || []).map((c: any) => c.name).join(", ");
      }
      setQuery("");
      setResults([]);
      setPosterPreview({ result, detail, director });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUrlAdd = async () => {
    setUrlError("");
    const parsed = parseTmdbUrl(urlInput.trim());
    if (!parsed) {
      setUrlError("Paste a valid TMDB URL, e.g. themoviedb.org/movie/12345");
      return;
    }
    setLoadingId(-1);
    try {
      await buildAndSave(parsed.type, parsed.id);
      setUrlMode(false);
      setUrlInput("");
      setQuery("");
      setResults([]);
    } catch {
      setUrlError("Couldn't fetch that title. Check the URL and try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const allGenres = Array.from(
    new Set(items.flatMap((i) => (i.genre || "").split(", ").filter(Boolean))),
  ).sort();
  const allDirectors = Array.from(
    new Set(items.map((i) => i.director).filter(Boolean)),
  ).sort() as string[];

  const sortedItems = [...items].sort((a, b) => {
    const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
    const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
    return dateB - dateA;
  });

  const filtered = sortedItems.filter((i) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    if (filterType === "genre") return i.genre.toLowerCase().includes(q);
    if (filterType === "director") return i.director.toLowerCase().includes(q);
    return (
      i.title.toLowerCase().includes(q) ||
      i.genre.toLowerCase().includes(q) ||
      i.director.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (selectedItem) {
      const updated = items.find((i) => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [items]);

  const addedIds = new Set(items.map((i) => i.tmdbId));

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE]">

      {/* Header */}
      <div className="px-5 pt-14 pb-0">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-[42px] font-light text-[#1A1A1A] leading-none tracking-tight">
            Films & TV
          </h1>
          <span className="font-serif text-[42px] font-light text-[#1A1A1A] leading-none tracking-tight">
            {items.length}
          </span>
        </div>
      </div>

      {/* Search / Add bar */}
      <div className="px-5 py-3.5 border-b border-[#1A1A1A]/8">
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait" initial={false}>
            {!urlMode ? (
              <motion.input
                key="search"
                ref={searchInputRef}
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent font-serif text-[28px] font-light placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] leading-none tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : (
              <motion.input
                key="url"
                ref={urlInputRef}
                type="url"
                placeholder="themoviedb.org/movie/…"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlAdd()}
                className="flex-1 bg-transparent text-[15px] font-light placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] leading-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 flex-shrink-0">
            {isSearching || loadingId !== null ? (
              <Loader2
                className="w-4 h-4 animate-spin text-[#1A1A1A]/25"
                strokeWidth={1.5}
              />
            ) : urlMode ? (
              <button
                onClick={handleUrlAdd}
                className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-semibold"
              >
                Fetch
              </button>
            ) : null}

            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center transition-colors ${
                filterOpen ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              }`}
            >
              <motion.div
                animate={{ rotate: filterOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
              </motion.div>
            </button>
          </div>
        </div>

        {urlMode && urlError && (
          <p className="text-[12px] text-[#8B2635] mt-2">{urlError}</p>
        )}

        {urlMode && (
          <div className="mt-2">
            <button
              onClick={() => {
                setUrlMode(false);
                setUrlInput("");
                setUrlError("");
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/35 font-medium"
            >
              ← Back to search
            </button>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      <AnimatePresence>
        {!urlMode && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-[#1A1A1A]/8"
          >
            <div className="max-h-[52vh] overflow-y-auto">
              {results.map((r) => {
                const alreadyAdded = addedIds.has(r.id);
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-[#1A1A1A]/7"
                  >
                    {r.poster_path ? (
                      <img
                        src={posterUrl(r.poster_path, "w92")}
                        alt=""
                        className="w-8 h-[48px] object-cover flex-shrink-0 cursor-pointer active:opacity-70 transition-opacity"
                        onClick={() => handlePosterClick(r)}
                      />
                    ) : (
                      <div className="w-8 h-[48px] bg-[#1A1A1A]/6 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[17px] font-light text-[#1A1A1A] leading-tight truncate">
                        {r.title || r.name}
                      </p>
                      <p className="text-[10px] text-[#1A1A1A]/35 mt-0.5 tracking-wide">
                        {(r.release_date || r.first_air_date || "").slice(0, 4)}
                        {"  ·  "}
                        <span className="uppercase text-[9px] tracking-[0.15em]">
                          {r.media_type === "tv" ? "TV" : "Film"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleQuickAdd(r, e)}
                      disabled={alreadyAdded || loadingId === r.id}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center transition-colors"
                    >
                      {loadingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
                      ) : alreadyAdded ? (
                        <span className="text-[9px] text-[#1A1A1A]/25">✓</span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#1A1A1A]" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                );
              })}
              {query.trim().length > 1 && (
                <div className="px-5 py-3">
                  <button
                    onClick={() => {
                      setUrlMode(true);
                      setTimeout(() => urlInputRef.current?.focus(), 50);
                    }}
                    className="flex items-center gap-2 text-[11px] text-[#1A1A1A]/35 hover:text-[#1A1A1A]/60 transition-colors"
                  >
                    <Link className="w-3 h-3" strokeWidth={1.5} />
                    Can't find it? Paste a TMDB URL instead
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-[#1A1A1A]/8"
          >
            <div className="px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Search
                  className="w-3 h-3 text-[#1A1A1A]/25 flex-shrink-0"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Filter by title, genre, director…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="bg-transparent text-[12px] tracking-wide placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] w-full"
                />
              </div>

              {filterQuery.length > 0 && (
                <div className="flex gap-2 mt-2.5">
                  {(["all", "genre", "director"] as const).map((type) => (
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

              {filterType === "genre" && filterQuery.length === 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {allGenres.slice(0, 8).map((genre) => (
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

              {filterType === "director" && filterQuery.length === 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {allDirectors.slice(0, 6).map((director) => (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-nav">
        {filtered.length === 0 ? (
          <div className="px-5 pt-14">
            <p className="font-serif text-[22px] font-light italic text-[#1A1A1A]/20 leading-snug">
              Your collection
              <br />
              is waiting.
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
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-12 h-[72px] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-[72px] bg-[#1A1A1A]/6 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-serif text-[22px] font-light text-[#1A1A1A] leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1.5 font-light">
                    {[item.year, item.director].filter(Boolean).join("  ·  ")}
                  </p>
                  {item.genre && (
                    <p className="text-[11px] tracking-wide text-[#1A1A1A]/25 mt-0.5 font-light">
                      {item.genre}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 pt-0.5 flex-shrink-0">
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

      {/* Search poster preview sheet — no auto-add */}
      <AnimatePresence>
        {posterPreview && (
          <SearchPreviewSheet
            preview={posterPreview}
            alreadySaved={addedIds.has(posterPreview.result.id)}
            onClose={() => setPosterPreview(null)}
            onAdd={async () => {
              await buildAndSave(
                posterPreview.result.media_type,
                posterPreview.result.id,
                posterPreview.result,
              );
              setPosterPreview(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
