import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Check } from "lucide-react";
import type { MovieItem, BookItem, PersonItem } from "@/hooks/use-library";
import { usePeople } from "@/hooks/use-library";
import { searchPeople, profileUrl, getMovieDetails, getTVDetails } from "@/lib/tmdb";

type Item = MovieItem | BookItem | PersonItem;

interface Props {
  item: Item | null;
  type: "movie" | "book" | "person";
  onClose: () => void;
  onDelete: (id: string) => void;
  onRatingChange?: (id: string, rating: number) => void;
}

interface PersonPreview {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: { title?: string; name?: string }[];
}

interface DirectorFilm {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
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

function ClickableNames({ label, names, onTap }: { label: string; names: string[]; onTap: (name: string) => void }) {
  if (!names.length) return null;
  return (
    <div className="py-4 border-b border-[#1A1A1A]/7">
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-2.5 font-medium">{label}</p>
      <div className="flex flex-wrap gap-y-1 gap-x-0">
        {names.map((name, i) => (
          <span key={name}>
            <button onClick={() => onTap(name)} className="text-[15px] font-light text-[#1A1A1A] underline underline-offset-2 decoration-[#1A1A1A]/20 active:opacity-50">{name}</button>
            {i < names.length - 1 && <span className="text-[15px] font-light text-[#1A1A1A]/40">,&nbsp;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function RatingPicker({ value, onChange }: { value?: number; onChange: (r: number) => void }) {
  const steps = [];
  for (let i = 0; i <= 10; i += 0.5) steps.push(i);

  return (
    <div className="py-4 border-b border-[#1A1A1A]/7">
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-3 font-medium">Rating</p>
      <div className="flex flex-wrap gap-1.5">
        {steps.map((step) => (
          <button
            key={step}
            onClick={() => onChange(step)}
            className={`min-w-[36px] px-2 py-1.5 text-[11px] tracking-wide border transition-colors ${
              value === step
                ? "border-[#8B2635] text-[#8B2635] bg-[#8B2635]/5"
                : "border-[#1A1A1A]/15 text-[#1A1A1A]/40 hover:border-[#1A1A1A]/40 hover:text-[#1A1A1A]/70"
            }`}
          >
            {step % 1 === 0 ? step.toFixed(0) : step.toFixed(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function DirectorFilms({ director, tmdbId, currentTitle, savedTitles }: {
  director: string;
  tmdbId: number;
  currentTitle: string;
  savedTitles: string[];
}) {
  const [films, setFilms] = useState<DirectorFilm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDirectorFilms() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/person/${tmdbId}/movie_credits?api_key=2428c93b0a5eda8535766a3dc580e353`
        );
        const data = await res.json();
        const directed = (data.crew || [])
          .filter((c: any) => c.job === "Director" && c.title !== currentTitle)
          .sort((a: any, b: any) => (b.release_date || "").localeCompare(a.release_date || ""))
          .slice(0, 8);
        setFilms(directed);
      } catch {
        setFilms([]);
      } finally {
        setLoading(false);
      }
    }
    if (tmdbId) fetchDirectorFilms();
  }, [tmdbId, currentTitle]);

  if (loading) return (
    <div className="py-4 border-b border-[#1A1A1A]/7">
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-2 font-medium">More from {director}</p>
      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/25" strokeWidth={1.5} />
    </div>
  );

  if (!films.length) return null;

  const saved = films.filter(f => savedTitles.includes(f.title));
  const suggested = films.filter(f => !savedTitles.includes(f.title));

  return (
    <>
      {saved.length > 0 && (
        <div className="py-4 border-b border-[#1A1A1A]/7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-3 font-medium">Also saved from {director}</p>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {saved.map(film => (
              <div key={film.id} className="flex-shrink-0 w-16">
                {film.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w185${film.poster_path}`} alt={film.title} className="w-16 h-24 object-cover" />
                ) : (
                  <div className="w-16 h-24 bg-[#1A1A1A]/6" />
                )}
                <p className="text-[9px] text-[#1A1A1A]/50 mt-1 leading-tight line-clamp-2">{film.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {suggested.length > 0 && (
        <div className="py-4 border-b border-[#1A1A1A]/7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-3 font-medium">Other films by {director}</p>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {suggested.map(film => (
              <div key={film.id} className="flex-shrink-0 w-16">
                {film.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w185${film.poster_path}`} alt={film.title} className="w-16 h-24 object-cover" />
                ) : (
                  <div className="w-16 h-24 bg-[#1A1A1A]/6" />
                )}
                <p className="text-[9px] text-[#1A1A1A]/50 mt-1 leading-tight line-clamp-2">{film.title}</p>
                <p className="text-[9px] text-[#1A1A1A]/25 mt-0.5">{(film.release_date || "").slice(0, 4)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function PersonCard({ person, onClose }: { person: PersonPreview; onClose: () => void }) {
  const { items, add } = usePeople();
  const [saving, setSaving] = useState(false);
  const alreadySaved = items.some((p) => p.tmdbId === person.id);

  const handleSave = () => {
    if (alreadySaved) return;
    setSaving(true);
    const knownForTitles = (person.known_for || []).map((k) => k.title || k.name || "").filter(Boolean);
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
    <motion.div className="fixed inset-0 z-60 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}>
      <div className="absolute inset-0 bg-[#1A1A1A]/20" />
      <motion.div className="relative w-full bg-[#F5F2EE] border-t border-[#1A1A1A]/10 z-10" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-start gap-4 px-5 pt-6 pb-5">
          {person.profile_path ? (
            <img src={profileUrl(person.profile_path, "w185")} alt={person.name} className="w-16 h-20 object-cover object-top flex-shrink-0" />
          ) : (
            <div className="w-16 h-20 bg-[#1A1A1A]/8 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 pt-1">
            <p className="font-serif text-[24px] font-light text-[#1A1A1A] leading-tight">{person.name}</p>
            {person.known_for_department && <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1">{person.known_for_department}</p>}
            {person.known_for?.length > 0 && <p className="text-[11px] tracking-wide text-[#1A1A1A]/30 mt-0.5 truncate">{person.known_for.map((k) => k.title || k.name).filter(Boolean).slice(0, 3).join(", ")}</p>}
            <button onClick={handleSave} disabled={alreadySaved} className={`mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${alreadySaved ? "text-[#1A1A1A]/25" : "text-[#1A1A1A]"}`}>
              {alreadySaved ? (<><Check className="w-3 h-3" strokeWidth={2} />Saved</>) : saving ? (<Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />) : ("+ Save to People")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DetailView({ item, type, onClose, onDelete, onRatingChange }: Props) {
  const { items: savedMovies } = usePeople();
  const [personPreview, setPersonPreview] = useState<PersonPreview | null>(null);
  const [loadingPerson, setLoadingPerson] = useState<string | null>(null);
  const [directorTmdbId, setDirectorTmdbId] = useState<number | null>(null);

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

  // Fetch director TMDB id for "more from director" section
  useEffect(() => {
    async function fetchDirectorId() {
      if (!isMovie(item) || !item.director) return;
      try {
        const results = await searchPeople(item.director);
        if (results.length > 0) setDirectorTmdbId(results[0].id);
      } catch {}
    }
    fetchDirectorId();
  }, [item]);

  const savedMovieTitles = isMovie(item)
    ? (savedMovies as any[]).filter((m: any) => "director" in m && m.director === (item as MovieItem).director).map((m: any) => m.title)
    : [];

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
            <button onClick={onClose} className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 font-medium">← Back</button>
            <div className="flex items-center gap-3">
              {loadingPerson && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/30" strokeWidth={1.5} />}
              <button onClick={handleDelete} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#8B2635] font-medium">
                <Trash2 className="w-3 h-3" strokeWidth={2} />
                Remove
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {isMovie(item) && (
              <>
                {/* Poster + Rating side by side */}
                <div className="flex items-start gap-5 px-5 pt-8 pb-0">
                  {item.posterUrl && (
                    <img src={item.posterUrl} alt={item.title} className="w-28 shadow-sm object-cover flex-shrink-0" />
                  )}
                  {onRatingChange && (
                    <div className="flex-1 pt-1">
                      <RatingPicker
                        value={item.rating}
                        onChange={(r) => onRatingChange(item.id, r)}
                      />
                    </div>
                  )}
                </div>
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">
                    {item.type === "tv" ? "Television" : "Film"}{item.year ? `  ·  ${item.year}` : ""}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">{item.title}</h1>
                </div>
                <div className="px-5 mt-4">
                  {item.director && <ClickableNames label="Director" names={item.director.split(", ").filter(Boolean)} onTap={handleNameTap} />}
                  {item.cast.length > 0 && <ClickableNames label="Cast" names={item.cast.slice(0, 6)} onTap={handleNameTap} />}
                  <MetaRow label="Genre" value={(item as any).genre || ""} />
                  <MetaRow label="Synopsis" value={item.overview} />
                  {directorTmdbId && (
                    <DirectorFilms
                      director={item.director}
                      tmdbId={directorTmdbId}
                      currentTitle={item.title}
                      savedTitles={savedMovieTitles}
                    />
                  )}
                  <MetaRow label="Added" value={new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                </div>
              </>
            )}

            {isBook(item) && (
              <>
                <div className="flex justify-start px-5 pt-8 pb-0">
                  {item.coverUrl && <img src={item.coverUrl} alt={item.title} className="w-24 shadow-sm object-contain" />}
                </div>
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">Book{item.year ? `  ·  ${item.year}` : ""}</p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">{item.title}</h1>
                </div>
                <div className="px-5 mt-4">
                  {onRatingChange && <RatingPicker value={item.rating} onChange={(r) => onRatingChange(item.id, r)} />}
                  <MetaRow label="Author" value={item.author} />
                  <MetaRow label="Genre" value={(item as any).genre || ""} />
                  <MetaRow label="Description" value={item.description.replace(/<[^>]*>/g, "")} />
                  <MetaRow label="Added" value={new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                </div>
              </>
            )}

            {isPerson(item) && (
              <>
                {item.photoUrl && <div className="flex justify-start px-5 pt-8 pb-0"><img src={item.photoUrl} alt={item.name} className="w-28 h-36 object-cover object-top shadow-sm" /></div>}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">{item.knownFor || "Person"}</p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">{item.name}</h1>
                </div>
                <div className="px-5 mt-4">
                  <MetaRow label="Known For" value={item.knownForTitles.join(", ")} />
                  <MetaRow label="Added" value={new Date(item.dateAdded).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                </div>
              </>
            )}
          </div>

          <AnimatePresence>
            {personPreview && <PersonCard person={personPreview} onClose={() => setPersonPreview(null)} />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
