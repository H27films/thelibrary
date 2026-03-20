import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Loader2, Plus } from "lucide-react";
import { useBooks, type BookItem } from "@/hooks/use-library";
import { searchBooks } from "@/lib/google-books";
import { DetailView } from "@/components/detail-view";

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    description?: string;
  };
}

export default function Books() {
  const { items, add, remove } = useBooks();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<BookItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchBooks(query);
        setResults(res);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [query]);

  const handleQuickAdd = (book: GoogleBook, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingId(book.id);
    const info = book.volumeInfo;
    const item: BookItem = {
      id: `book-${book.id}-${Date.now()}`,
      title: info.title,
      author: (info.authors || []).join(", "),
      year: (info.publishedDate || "").slice(0, 4),
      genre: (info.categories || []).join(", "),
      coverUrl: info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
      description: info.description || "",
      googleBooksId: book.id,
      dateAdded: new Date().toISOString(),
    };
    add(item);
    setLoadingId(null);
  };

  const allAuthors = Array.from(
    new Set(items.map((i) => i.author).filter(Boolean))
  ).sort();

  const allGenres = Array.from(
    new Set(items.flatMap((i) => (i.genre || "").split(", ").filter(Boolean)))
  ).sort();

  const filtered = items.filter((i) =>
    filterQuery ? i.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      i.author.toLowerCase().includes(filterQuery.toLowerCase()) : true
  );

  const addedIds = new Set(items.map((i) => i.googleBooksId));

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE]">

      {/* Header */}
      <div className="px-5 pt-14 pb-0">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-[42px] font-light text-[#1A1A1A] leading-none tracking-tight">Books</h1>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 font-medium">{items.length}</span>
        </div>
      </div>

      {/* Search / Add bar */}
      <div className="px-5 py-3.5 border-b border-[#1A1A1A]/8">
        <div className="flex items-center gap-3">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent font-serif text-[28px] font-light placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] leading-none tracking-tight"
          />
          <div className="flex items-center gap-3 flex-shrink-0">
            {isSearching || loadingId !== null ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
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
      </div>

      {/* Search results dropdown — scrollable */}
      <AnimatePresence>
        {query.trim().length > 0 && (
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
                    {r.volumeInfo.imageLinks?.smallThumbnail ? (
                      <img
                        src={r.volumeInfo.imageLinks.smallThumbnail.replace("http://", "https://")}
                        alt=""
                        className="w-8 h-[48px] object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-[48px] bg-[#1A1A1A]/6 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[17px] font-light text-[#1A1A1A] leading-tight truncate">
                        {r.volumeInfo.title}
                      </p>
                      <p className="text-[10px] text-[#1A1A1A]/35 mt-0.5 tracking-wide truncate">
                        {(r.volumeInfo.authors || []).join(", ")}
                        {r.volumeInfo.publishedDate && (
                          <>{"  ·  "}{r.volumeInfo.publishedDate.slice(0, 4)}</>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleQuickAdd(r, e)}
                      disabled={alreadyAdded || loadingId === r.id}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center transition-colors"
                      data-testid={`result-book-${r.id}`}
                    >
                      {loadingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
                      ) : alreadyAdded ? (
                        <span className="text-[9px] text-[#1A1A1A]/25">✓</span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#1A1A1A]/40 hover:text-[#1A1A1A]" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                );
              })}
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
                <Search className="w-3 h-3 text-[#1A1A1A]/25 flex-shrink-0" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Filter by title or author…"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="bg-transparent text-[12px] tracking-wide placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] w-full"
                />
              </div>

              {/* Genre suggestions */}
              {filterQuery.length === 0 && allGenres.length > 0 && (
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                data-testid={`item-book-${item.id}`}
              >
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt={item.title} className="w-12 h-[72px] object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-[72px] bg-[#1A1A1A]/6 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-serif text-[22px] font-light text-[#1A1A1A] leading-tight">{item.title}</p>
                  <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1.5 font-light">{item.author}</p>
                  <p className="text-[11px] tracking-wide text-[#1A1A1A]/25 mt-0.5 font-light">
                    {[item.year, item.genre].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <DetailView item={selectedItem} type="book" onClose={() => setSelectedItem(null)} onDelete={remove} />
        )}
      </AnimatePresence>
    </div>
  );
}