const TMDB_KEY = "2428c93b0a5eda8535766a3dc580e353";
const BASE_URL = "http://localhost:5000";

const films = [
  { title: "INTERSTELLAR", director: "CHRISTOPHER NOLAN", rating: 8 },
  { title: "SYNECDOCHE NEW YORK", director: "CHARLIE KAUFMAN", rating: 8 },
  { title: "THE SALESMAN", director: "ASGHAR FARHADI", rating: 8 },
  { title: "A SEPARATION", director: "ASGHAR FARHADI", rating: 8 },
  { title: "EX MACHINA", director: "ALEX GARLAND", rating: 8 },
  { title: "BIRDMAN", director: "ALEJANDRO INARRITU", rating: 8 },
  { title: "LA GRANDE BELLEZZA", director: "PAOLO SORRENTINO", rating: 8 },
  { title: "TO KILL A TIGER", director: "NISHA PAHUJA", rating: 8 },
  { title: "TIME", director: "GARRETT BRADLEY", rating: 8 },
  { title: "SAVE ME", director: "LENNIE JAMES", rating: 8 },
  { title: "SEVERANCE", director: "DAN ERICKSON", rating: 8 },
  { title: "INGLOURIOUS BASTERDS", director: "QUENTIN TARANTINO", rating: 8 },
  { title: "GOOD TIME", director: "SAFDIE BROTHERS", rating: 8 },
  { title: "MO", director: "MO AMER", rating: 8 },
  { title: "ADOLESCENCE", director: "STEPHEN GRAHAM", rating: 8 },
];

async function searchTMDB(title) {
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  const data = await res.json();
  const results = (data.results || []).filter(r => r.media_type === "movie" || r.media_type === "tv");
  return results[0] || null;
}

async function getDetails(id, type) {
  const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_KEY}&append_to_response=credits`;
  const res = await fetch(url);
  return res.json();
}

async function saveToApp(item) {
  const res = await fetch(`${BASE_URL}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`Failed to save: ${await res.text()}`);
  return res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function importAll() {
  console.log(`\nStarting import of ${films.length} films...\n`);
  let success = 0;
  let failed = [];

  for (const film of films) {
    try {
      const result = await searchTMDB(film.title);
      if (!result) {
        console.log(`❌ NOT FOUND: ${film.title}`);
        failed.push(film.title);
        continue;
      }

      const mediaType = result.media_type;
      const detail = await getDetails(result.id, mediaType);

      let director = "";
      let cast = [];

      if (mediaType === "movie") {
        director = detail.credits?.crew?.find(c => c.job === "Director")?.name || film.director;
        cast = (detail.credits?.cast || []).slice(0, 6).map(c => c.name);
      } else {
        director = (detail.created_by || []).map(c => c.name).join(", ") || film.director;
        cast = (detail.credits?.cast || []).slice(0, 6).map(c => c.name);
      }

      const year = mediaType === "movie"
        ? (detail.release_date || "").slice(0, 4)
        : (detail.first_air_date || "").slice(0, 4);

      const genre = (detail.genres || []).map(g => g.name).join(", ");
      const posterUrl = detail.poster_path
        ? `https://image.tmdb.org/t/p/w342${detail.poster_path}`
        : "";

      await saveToApp({
        title: detail.title || detail.name,
        type: "film",
        metadata: {
          year,
          director,
          cast,
          genre,
          posterUrl,
          tmdbId: result.id,
          mediaType,
          overview: detail.overview || "",
          rating: film.rating,
        },
      });

      console.log(`✅ ${film.title} (${year}) — ${director} — ${film.rating}`);
      success++;

      await sleep(300);
    } catch (err) {
      console.log(`❌ ERROR: ${film.title} — ${err.message}`);
      failed.push(film.title);
    }
  }

  console.log(`\n✅ Imported: ${success}/${films.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.join(", ")}`);
  }
}

importAll();
