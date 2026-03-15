import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Check } from "lucide-react";
import type { MovieItem, BookItem, PersonItem } from "@/hooks/use-library";
import { usePeople } from "@/hooks/use-library";
import { searchPeople, profileUrl } from "@/lib/tmdb";

type Item = MovieItem | BookItem | PersonItem;

interface Props {
  item: Item | null;
  type: "movie" | "book" | "person";
  onClose: () => void;
  onDelete: (id: string) => void;
}

interface PersonPreview {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: { title?: string; name?: string }[];
}

function isMovie(item: Item): item is MovieItem {
  return "tmdbId" in item && "director" in item;
}
function isBook(item: Item): item is BookItem {
  return "googleBooksId" in item;
}
function isPerson(item: Item): item is PersonItem {
  return "knownFor" in item;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-4 border-b border-[#1A1A1A]/7">
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-1.5 font-medium">{label}</p>
      <p className="text-[15px] font-light text-[#1A1A1A] leading-relaxed">{value}</p>
    </div>
  );
}

function ClickableNames({
  label,
  names,
  onTap,
}: {
  label: string;
  names: string[];
  onTap: (name: string) => void;
}) {
  if (!names.length) return null;
  return (
    <div className="py-4 border-b border-[#1A1A1A]/7">
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-2.5 font-medium">{label}</p>
      <div className="flex flex-wrap gap-y-1 gap-x-0">
        {names.map((name, i) => (
          <span key={name}>
            <button
              onClick={() => onTap(name)}
              className="text-[15px] font-light text-[#1A1A1A] underline underline-offset-2 decoration-[#1A1A1A]/20 active:opacity-50"
            >
              {name}
            </button>
            {i < names.length - 1 && (
              <span className="text-[15px] font-light text-[#1A1A1A]/40">,&nbsp;</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  onClose,
}: {
  person: PersonPreview;
  onClose: () => void;
}) {
  const { items, add } = usePeople();
  const [saving, setSaving] = useState(false);
  const alreadySaved = items.some((p) => p.tmdbId === person.id);

  const handleSave = () => {
    if (alreadySaved) return;
    setSaving(true);
    const knownForTitles = (person.known_for || [])
      .map((k) => k.title || k.name || "")
      .filter(Boolean);
    add({
      id: `person-${person.id}-${Date.now()}`,
      name: person.name,
      photoUrl: profileUrl(person.profile_path),
      knownFor: person.known_for_department || "",
      knownForTitles,
      tmdbId: person.id,
      dateAdded: new Date().toISOString(),
    });
    setTimeout(() => setSaving(false), 600);
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
        className="relative w-full bg-[#F5F2EE] border-t border-[#1A1A1A]/10 z-10"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-start gap-4 px-5 pt-6 pb-5">
          {person.profile_path ? (
            <img
              src={profileUrl(person.profile_path, "w185")}
              alt={person.name}
              className="w-16 h-20 object-cover object-top flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-20 bg-[#1A1A1A]/8 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-serif text-[24px] font-light text-[#1A1A1A] leading-tight">{person.name}</p>
            {person.known_for_department && (
              <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1">{person.known_for_department}</p>
            )}
            {person.known_for?.length > 0 && (
              <p className="text-[11px] tracking-wide text-[#1A1A1A]/30 mt-0.5 truncate">
                {person.known_for.map((k) => k.title || k.name).filter(Boolean).slice(0, 3).join(", ")}
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={alreadySaved}
              className={`mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${
                alreadySaved ? "text-[#1A1A1A]/25" : "text-[#1A1A1A]"
              }`}
            >
              {alreadySaved ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={2} />
                  Saved
                </>
              ) : saving ? (
                <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
              ) : (
                "+ Save to People"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DetailView({ item, type, onClose, onDelete }: Props) {
  const [personPreview, setPersonPreview] = useState<PersonPreview | null>(null);
  const [loadingPerson, setLoadingPerson] = useState<string | null>(null);

  if (!item) return null;

  const handleDelete = () => {
    onDelete(item.id);
    onClose();
  };

  const handleNameTap = async (name: string) => {
    setLoadingPerson(name);
    try {
      const results = await searchPeople(name);
      if (results.length > 0) setPersonPreview(results[0]);
    } finally {
      setLoadingPerson(null);
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#F5F2EE] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-[#1A1A1A]/8">
            <button onClick={onClose} className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 font-medium">
              ← Back
            </button>
            <div className="flex items-center gap-3">
              {loadingPerson && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/30" strokeWidth={1.5} />
              )}
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#8B2635] font-medium"
              >
                <Trash2 className="w-3 h-3" strokeWidth={2} />
                Remove
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {isMovie(item) && (
              <>
                {item.posterUrl && (
                  <div className="flex justify-start px-5 pt-8 pb-0">
                    <img src={item.posterUrl} alt={item.title} className="w-28 shadow-sm object-cover" />
                  </div>
                )}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">
                    {item.type === "tv" ? "Television" : "Film"}
                    {item.year ? `  ·  ${item.year}` : ""}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">{item.title}</h1>
                </div>
                <div className="px-5 mt-4">
                  {item.director && (
                    <ClickableNames
                      label="Director"
                      names={item.director.split(", ").filter(Boolean)}
                      onTap={handleNameTap}
                    />
                  )}
                  {item.cast.length > 0 && (
                    <ClickableNames
                      label="Cast"
                      names={item.cast.slice(0, 6)}
                      onTap={handleNameTap}
                    />
                  )}
                  <MetaRow label="Synopsis" value={item.overview} />
                  <MetaRow
                    label="Added"
                    value={new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  />
                </div>
              </>
            )}

            {isBook(item) && (
              <>
                {item.coverUrl && (
                  <div className="flex justify-start px-5 pt-8 pb-0">
                    <img src={item.coverUrl} alt={item.title} className="w-24 shadow-sm object-contain" />
                  </div>
                )}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">
                    Book{item.year ? `  ·  ${item.year}` : ""}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">{item.title}</h1>
                </div>
                <div className="px-5 mt-4">
                  <MetaRow label="Author" value={item.author} />
                  <MetaRow label="Description" value={item.description.replace(/<[^>]*>/g, "")} />
                  <MetaRow
                    label="Added"
                    value={new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  />
                </div>
              </>
            )}

            {isPerson(item) && (
              <>
                {item.photoUrl && (
                  <div className="flex justify-start px-5 pt-8 pb-0">
                    <img src={item.photoUrl} alt={item.name} className="w-28 h-36 object-cover object-top shadow-sm" />
                  </div>
                )}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">
                    {item.knownFor || "Person"}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">{item.name}</h1>
                </div>
                <div className="px-5 mt-4">
                  <MetaRow label="Known For" value={item.knownForTitles.join(", ")} />
                  <MetaRow
                    label="Added"
                    value={new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  />
                </div>
              </>
            )}
          </div>

          {/* Person preview card */}
          <AnimatePresence>
            {personPreview && (
              <PersonCard person={personPreview} onClose={() => setPersonPreview(null)} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
