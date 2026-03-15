import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import type { MovieItem, BookItem, PersonItem } from "@/hooks/use-library";

type Item = MovieItem | BookItem | PersonItem;

interface Props {
  item: Item | null;
  type: "movie" | "book" | "person";
  onClose: () => void;
  onDelete: (id: string) => void;
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

export function DetailView({ item, type, onClose, onDelete }: Props) {
  if (!item) return null;

  const handleDelete = () => {
    onDelete(item.id);
    onClose();
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
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#8B2635] font-medium"
            >
              <Trash2 className="w-3 h-3" strokeWidth={2} />
              Remove
            </button>
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
                  <MetaRow label="Director" value={item.director} />
                  <MetaRow label="Cast" value={item.cast.slice(0, 5).join(", ")} />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
