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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/8">
            <button onClick={onClose} className="p-1 text-[#1A1A1A]/50 hover:text-[#1A1A1A] transition-colors">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#8B2635] font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              Remove
            </button>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar pb-12">
            {isMovie(item) && (
              <div className="flex flex-col">
                {item.posterUrl && (
                  <div className="w-full aspect-[2/3] max-h-72 overflow-hidden bg-black/5">
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover object-top" />
                  </div>
                )}
                <div className="px-5 pt-8 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#8B2635] font-semibold mb-2">
                    {item.type === "tv" ? "Television" : "Film"} · {item.year}
                  </p>
                  <h1 className="font-serif text-3xl font-medium text-[#1A1A1A] leading-tight mb-6">{item.title}</h1>

                  <div className="space-y-4 border-t border-black/8 pt-6">
                    {item.director && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Director</p>
                        <p className="text-[15px] text-[#1A1A1A]">{item.director}</p>
                      </div>
                    )}
                    {item.cast.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Cast</p>
                        <p className="text-[15px] text-[#1A1A1A]">{item.cast.slice(0, 5).join(", ")}</p>
                      </div>
                    )}
                    {item.overview && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Synopsis</p>
                        <p className="text-[15px] leading-relaxed text-[#1A1A1A]/80">{item.overview}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Added</p>
                      <p className="text-[15px] text-[#1A1A1A]/60">
                        {new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isBook(item) && (
              <div className="flex flex-col">
                {item.coverUrl && (
                  <div className="w-full flex justify-center pt-10 pb-6 px-10">
                    <img src={item.coverUrl} alt={item.title} className="max-h-64 shadow-lg object-contain" />
                  </div>
                )}
                <div className="px-5 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#8B2635] font-semibold mb-2">
                    Book · {item.year}
                  </p>
                  <h1 className="font-serif text-3xl font-medium text-[#1A1A1A] leading-tight mb-6">{item.title}</h1>

                  <div className="space-y-4 border-t border-black/8 pt-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Author</p>
                      <p className="text-[15px] text-[#1A1A1A]">{item.author}</p>
                    </div>
                    {item.description && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Description</p>
                        <p className="text-[15px] leading-relaxed text-[#1A1A1A]/80">{item.description.replace(/<[^>]*>/g, "")}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Added</p>
                      <p className="text-[15px] text-[#1A1A1A]/60">
                        {new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPerson(item) && (
              <div className="flex flex-col">
                {item.photoUrl && (
                  <div className="w-full aspect-[3/4] max-h-64 overflow-hidden bg-black/5">
                    <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover object-top" />
                  </div>
                )}
                <div className="px-5 pt-8 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#8B2635] font-semibold mb-2">
                    {item.knownFor}
                  </p>
                  <h1 className="font-serif text-3xl font-medium text-[#1A1A1A] leading-tight mb-6">{item.name}</h1>

                  <div className="space-y-4 border-t border-black/8 pt-6">
                    {item.knownForTitles.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Known For</p>
                        <p className="text-[15px] text-[#1A1A1A]">{item.knownForTitles.join(", ")}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-1">Added</p>
                      <p className="text-[15px] text-[#1A1A1A]/60">
                        {new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
