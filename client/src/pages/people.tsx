import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Loader2 } from "lucide-react";
import { usePeople, type PersonItem } from "@/hooks/use-library";
import { searchPeople, profileUrl } from "@/lib/tmdb";
import { DetailView } from "@/components/detail-view";

interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: { title?: string; name?: string }[];
}

export default function People() {
  const { items, add, remove } = usePeople();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PersonItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchPeople(query);
        setResults(res);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, [query]);

  const handleAdd = (person: TMDBPerson) => {
    const knownForTitles = (person.known_for || [])
      .map((k) => k.title || k.name || "")
      .filter(Boolean);

    const item: PersonItem = {
      id: `person-${person.id}-${Date.now()}`,
      name: person.name,
      photoUrl: profileUrl(person.profile_path),
      knownFor: person.known_for_department || "",
      knownForTitles,
      tmdbId: person.id,
      dateAdded: new Date().toISOString(),
    };
    add(item);
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  const filtered = items.filter((i) =>
    filterQuery ? i.name.toLowerCase().includes(filterQuery.toLowerCase()) : true
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE]">
      {/* Header */}
      <div className="px-5 pt-14 pb-0">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-[42px] font-light text-[#1A1A1A] leading-none tracking-tight">People</h1>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 font-medium">{items.length}</span>
        </div>
        <div className="h-px bg-[#1A1A1A]/10 mt-5" />
      </div>

      {/* Filter + Add */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-[#1A1A1A]/8">
        <div className="flex items-center gap-2.5 flex-1">
          <Search className="w-3 h-3 text-[#1A1A1A]/25 flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            placeholder="Filter"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="bg-transparent text-[12px] tracking-wide placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A] w-full"
          />
        </div>
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
          className="flex items-center text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors ml-4"
          data-testid="button-add-person"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
        </button>
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
                data-testid={`item-person-${item.id}`}
              >
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt={item.name} className="w-12 h-[72px] object-cover object-top flex-shrink-0" />
                ) : (
                  <div className="w-12 h-[72px] bg-[#1A1A1A]/6 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-serif text-[22px] font-light text-[#1A1A1A] leading-tight">{item.name}</p>
                  {item.knownFor && (
                    <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1.5 font-light">{item.knownFor}</p>
                  )}
                  {item.knownForTitles.length > 0 && (
                    <p className="text-[11px] tracking-wide text-[#1A1A1A]/25 mt-0.5 font-light truncate">
                      {item.knownForTitles.slice(0, 3).join(", ")}
                    </p>
                  )}
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
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-[#1A1A1A]/30 flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search people…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[18px] font-light placeholder:text-[#1A1A1A]/20 focus:outline-none text-[#1A1A1A]"
                  data-testid="input-search-person"
                />
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
                ) : (
                  <button
                    onClick={() => { setSearchOpen(false); setQuery(""); setResults([]); }}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/35 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {results.map((r) => (
                <button
                  key={r.id}
                  className="w-full flex items-center gap-4 px-5 py-4 border-b border-[#1A1A1A]/7 text-left active:bg-[#1A1A1A]/[0.02]"
                  onClick={() => handleAdd(r)}
                  data-testid={`result-person-${r.id}`}
                >
                  {r.profile_path ? (
                    <img
                      src={profileUrl(r.profile_path, "w92")}
                      alt=""
                      className="w-10 h-[60px] object-cover object-top flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-[60px] bg-[#1A1A1A]/6 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[20px] font-light text-[#1A1A1A] leading-tight">{r.name}</p>
                    <p className="text-[11px] text-[#1A1A1A]/35 mt-1 tracking-wide">{r.known_for_department}</p>
                    <p className="text-[11px] text-[#1A1A1A]/25 mt-0.5 tracking-wide truncate">
                      {(r.known_for || []).map((k) => k.title || k.name).filter(Boolean).slice(0, 3).join(", ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <DetailView item={selectedItem} type="person" onClose={() => setSelectedItem(null)} onDelete={remove} />
        )}
      </AnimatePresence>
    </div>
  );
}
