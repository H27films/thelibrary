import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Check, Plus } from "lucide-react";
import type { MovieItem, BookItem, PersonItem } from "@/hooks/use-library";
import { usePeople, useMovies } from "@/hooks/use-library";
import { searchPeople, profileUrl } from "@/lib/tmdb";

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
  overview: string;
  genres?: { id: number; name: string }[];
  credits?: { cast: any[]; crew: any[] };
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
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-1.5 font-medium">
        {label}
      </p>
      <p className="text-[15px] font-light text-[#1A1A1A] leading-relaxed">
        {value}
      </p>
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
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-2.5 font-medium">
        {label}
      </p>
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
              <span className="text-[15px] font-light text-[#1A1A1A]/40">
                ,&nbsp;
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function RatingPicker({
  value,
  onChange,
}: {
  value?: number;
  onChange: (r: number) => void;
}) {
  const [inputVal, setInputVal] = useState(
    value !== undefined && value !== null ? String(value) : "",
  );

  useEffect(() => {
    setInputVal(value !== undefined && value !== null ? String(value) : "");
  }, [value]);

  const handleBlur = () => {
    const num = parseFloat(inputVal);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      const rounded = Math.round(num * 2) / 2;
      const display = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
      setInputVal(display);
      onChange(rounded);
    } else {
      setInputVal(value !== undefined && value !== null ? String(value) : "");
    }
  };

  return (
    <div className="py-4 border-b border-[#1A1A1A]/7">
      <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-2 font-medium">
        Rating
      </p>
      <input
        type="number"
        min="0"
        max="10"
        step="0.5"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={handleBlur}
        placeholder="—"
        className="bg-transparent text-[42px] font-serif font-light text-[#1A1A1A] w-32 focus:outline-none placeholder:text-[#1A1A1A]/15 leading-none"
      />
      <p className="text-[10px] text-[#1A1A1A]/25 mt-1">
        Enter 0 – 10, rounded to 0.5
      </p>
    </div>
  );
}

function FilmDetailSheet({
  film,
  director,
  onClose,
  onAdd,
  alreadySaved,
}: {
  film: DirectorFilm;
  director: string;
  onClose: () => void;
  onAdd: () => void;
  alreadySaved: boolean;
}) {
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
        <div className="flex items-start gap-4 px-5 pt-6 pb-4">
          {film.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${film.poster_path}`}
              alt={film.title}
              className="w-20 h-28 object-cover flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-20 h-28 bg-[#1A1A1A]/6 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-2">
              Film · {(film.release_date || "").slice(0, 4)}
            </p>
            <p className="font-serif text-[26px] font-light text-[#1A1A1A] leading-tight">
              {film.title}
            </p>
            <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1">
              {director}
            </p>
            {film.overview && (
              <p className="text-[13px] font-light text-[#1A1A1A]/60 mt-3 leading-relaxed line-clamp-3">
                {film.overview}
              </p>
            )}
            <button
              onClick={onAdd}
              disabled={alreadySaved}
              className={`mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${
                alreadySaved ? "text-[#1A1A1A]/25" : "text-[#1A1A1A]"
              }`}
            >
              {alreadySaved ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={2} />
                  Saved
                </>
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

function DirectorFilms({
  director,
  directorTmdbId,
  currentTitle,
  savedTitles,
  onAddFilm,
}: {
  director: string;
  directorTmdbId: number;
  currentTitle: string;
  savedTitles: string[];
  onAddFilm: (film: DirectorFilm) => void;
}) {
  const [films, setFilms] = useState<DirectorFilm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState<DirectorFilm | null>(null);

  useEffect(() => {
    async function fetchDirectorFilms() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/person/${directorTmdbId}/movie_credits?api_key=2428c93b0a5eda8535766a3dc580e353`,
        );
        const data = await res.json();
        const directed = (data.crew || [])
          .filter((c: any) => c.job === "Director" && c.title !== currentTitle)
          .sort((a: any, b: any) =>
            (b.release_date || "").localeCompare(a.release_date || ""),
          )
          .slice(0, 10);
        setFilms(directed);
      } catch {
        setFilms([]);
      } finally {
        setLoading(false);
      }
    }
    if (directorTmdbId) fetchDirectorFilms();
  }, [directorTmdbId, currentTitle]);

  if (loading)
    return (
      <div className="py-4 border-b border-[#1A1A1A]/7">
        <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-2 font-medium">
          More from {director}
        </p>
        <Loader2
          className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/25"
          strokeWidth={1.5}
        />
      </div>
    );

  if (!films.length) return null;

  const saved = films.filter((f) => savedTitles.includes(f.title));
  const suggested = films.filter((f) => !savedTitles.includes(f.title));

  const FilmCard = ({ film }: { film: DirectorFilm }) => (
    <button
      className="flex-shrink-0 w-16 text-left active:opacity-70 transition-opacity"
      onClick={() => setSelectedFilm(film)}
    >
      {film.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${film.poster_path}`}
          alt={film.title}
          className="w-16 h-24 object-cover"
        />
      ) : (
        <div className="w-16 h-24 bg-[#1A1A1A]/6" />
      )}
      <p className="text-[9px] text-[#1A1A1A]/50 mt-1 leading-tight line-clamp-2">
        {film.title}
      </p>
      <p className="text-[9px] text-[#1A1A1A]/25 mt-0.5">
        {(film.release_date || "").slice(0, 4)}
      </p>
    </button>
  );

  return (
    <>
      {saved.length > 0 && (
        <div className="py-4 border-b border-[#1A1A1A]/7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-3 font-medium">
            Also saved from {director}
          </p>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {saved.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </div>
      )}
      {suggested.length > 0 && (
        <div className="py-4 border-b border-[#1A1A1A]/7">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#1A1A1A]/35 mb-3 font-medium">
            Other films by {director}
          </p>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {suggested.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedFilm && (
          <FilmDetailSheet
            film={selectedFilm}
            director={director}
            onClose={() => setSelectedFilm(null)}
            alreadySaved={savedTitles.includes(selectedFilm.title)}
            onAdd={() => {
              onAddFilm(selectedFilm);
              setSelectedFilm(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
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
            <p className="font-serif text-[24px] font-light text-[#1A1A1A] leading-tight">
              {person.name}
            </p>
            {person.known_for_department && (
              <p className="text-[11px] tracking-wide text-[#1A1A1A]/40 mt-1">
                {person.known_for_department}
              </p>
            )}
            {person.known_for?.length > 0 && (
              <p className="text-[11px] tracking-wide text-[#1A1A1A]/30 mt-0.5 truncate">
                {person.known_for
                  .map((k) => k.title || k.name)
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(", ")}
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={alreadySaved}
              className={`mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${alreadySaved ? "text-[#1A1A1A]/25" : "text-[#1A1A1A]"}`}
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

export function DetailView({
  item,
  type,
  onClose,
  onDelete,
  onRatingChange,
}: Props) {
  const { items: savedMovies, add: addMovie } = useMovies();
  const [personPreview, setPersonPreview] = useState<PersonPreview | null>(
    null,
  );
  const [loadingPerson, setLoadingPerson] = useState<string | null>(null);
  const [directorTmdbId, setDirectorTmdbId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDirectorId() {
      if (!item || !isMovie(item) || !item.director) return;
      try {
        const results = await searchPeople(item.director);
        if (results.length > 0) setDirectorTmdbId(results[0].id);
      } catch {}
    }
    fetchDirectorId();
  }, [item]);

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

  const savedMovieTitles = isMovie(item)
    ? savedMovies
        .filter(
          (m) =>
            m.director === (item as MovieItem).director &&
            m.title !== item.title,
        )
        .map((m) => m.title)
    : [];

  const handleAddDirectorFilm = async (film: DirectorFilm) => {
    if (!isMovie(item)) return;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${film.id}?api_key=2428c93b0a5eda8535766a3dc580e353&append_to_response=credits`,
      );
      const detail = await res.json();
      const director =
        detail.credits?.crew?.find((c: any) => c.job === "Director")?.name ||
        (item as MovieItem).director;
      const cast = (detail.credits?.cast || [])
        .slice(0, 6)
        .map((c: any) => c.name);
      const genre = (detail.genres || []).map((g: any) => g.name).join(", ");
      addMovie({
        id: `movie-${film.id}-${Date.now()}`,
        title: film.title,
        year: (film.release_date || "").slice(0, 4),
        director,
        cast,
        genre,
        posterUrl: film.poster_path
          ? `https://image.tmdb.org/t/p/w342${film.poster_path}`
          : "",
        tmdbId: film.id,
        type: "movie",
        overview: film.overview || "",
        dateAdded: new Date().toISOString(),
      });
    } catch {}
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
            <button
              onClick={onClose}
              className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 font-medium"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              {loadingPerson && (
                <Loader2
                  className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]/30"
                  strokeWidth={1.5}
                />
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
                <div className="flex items-start gap-5 px-5 pt-8 pb-0">
                  {item.posterUrl && (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-28 shadow-sm object-cover flex-shrink-0"
                    />
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
                    {item.type === "tv" ? "Television" : "Film"}
                    {item.year ? `  ·  ${item.year}` : ""}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">
                    {item.title}
                  </h1>
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
                  <MetaRow label="Genre" value={(item as any).genre || ""} />
                  <MetaRow label="Synopsis" value={item.overview} />
                  {directorTmdbId && (
                    <DirectorFilms
                      director={item.director}
                      directorTmdbId={directorTmdbId}
                      currentTitle={item.title}
                      savedTitles={savedMovieTitles}
                      onAddFilm={handleAddDirectorFilm}
                    />
                  )}
                  <MetaRow
                    label="Added"
                    value={new Date(item.dateAdded).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  />
                </div>
              </>
            )}

            {isBook(item) && (
              <>
                <div className="flex items-start gap-5 px-5 pt-8 pb-0">
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-24 shadow-sm object-contain flex-shrink-0"
                    />
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
                    Book{item.year ? `  ·  ${item.year}` : ""}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">
                    {item.title}
                  </h1>
                </div>
                <div className="px-5 mt-4">
                  <MetaRow label="Author" value={item.author} />
                  <MetaRow label="Genre" value={(item as any).genre || ""} />
                  <MetaRow
                    label="Description"
                    value={item.description.replace(/<[^>]*>/g, "")}
                  />
                  <MetaRow
                    label="Added"
                    value={new Date(item.dateAdded).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  />
                </div>
              </>
            )}

            {isPerson(item) && (
              <>
                {item.photoUrl && (
                  <div className="flex justify-start px-5 pt-8 pb-0">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-28 h-36 object-cover object-top shadow-sm"
                    />
                  </div>
                )}
                <div className="px-5 pt-6 pb-2">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8B2635] font-medium mb-3">
                    {item.knownFor || "Person"}
                  </p>
                  <h1 className="font-serif text-[32px] font-light text-[#1A1A1A] leading-tight tracking-tight">
                    {item.name}
                  </h1>
                </div>
                <div className="px-5 mt-4">
                  <MetaRow
                    label="Known For"
                    value={item.knownForTitles.join(", ")}
                  />
                  <MetaRow
                    label="Added"
                    value={new Date(item.dateAdded).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  />
                </div>
              </>
            )}
          </div>

          <AnimatePresence>
            {personPreview && (
              <PersonCard
                person={personPreview}
                onClose={() => setPersonPreview(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
