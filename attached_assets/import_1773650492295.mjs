const TMDB_KEY = "2428c93b0a5eda8535766a3dc580e353";
const BASE_URL = "http://localhost:5000";

const films = [
  { title: "GODFATHER", director: "FRANCIS FORD COPPOLA", rating: 9.5 },
  { title: "BLUE VALENTINE", director: "DEREK CIANFRANCE", rating: 9.5 },
  { title: "HER", director: "SPIKE JONZE", rating: 9 },
  { title: "THERE WILL BE BLOOD", director: "PAUL THOMAS ANDERSON", rating: 9 },
  { title: "MONSTER", director: "HIROKAZU KOREEDA", rating: 9 },
  { title: "THE PROPHET", director: "JACQUES AUDIARD", rating: 9 },
  { title: "THE DARK KNIGHT", director: "CHRISTOPHER NOLAN", rating: 9 },
  { title: "PARASITE", director: "BONG JOON HO", rating: 9 },
  { title: "MOONLIGHT", director: "BARRY JENKINS", rating: 9 },
  { title: "DAUGHTERS", director: "ANGELA PATTEN", rating: 9 },
  { title: "ANATOMY OF A FALL", director: "JUSTINE TRIET", rating: 9 },
  { title: "THE BEAR", director: "CHRISTOPHER STORER", rating: 9 },
  { title: "BABY REINDEER", director: "RICHARD GADD", rating: 9 },
  { title: "CAMERAPERSON", director: "KIRSTEN JOHNSON", rating: 9 },
  { title: "CLOSE UP", director: "ABBAS KIAROSTAMI", rating: 9 },
  { title: "THE TASTE OF CHERRY", director: "ABBAS KIAROSTAMI", rating: 9 },
  { title: "LA HAINE", director: "MATTHIEU KASSOVITZ", rating: 9 },
  { title: "THE DARK KNIGHT RISES", director: "CHRISTOPHER NOLAN", rating: 8.5 },
  { title: "OPPENHEIMER", director: "CHRISTOPHER NOLAN", rating: 8.5 },
  { title: "LOVELESS", director: "ANDREY ZVYAGINTSEV", rating: 8.5 },
  { title: "THE STALKER", director: "ANDREI TARKOVSKY", rating: 8.5 },
  { title: "BIUTIFUL", director: "ALEJANDRO INARRITU", rating: 8.5 },
  { title: "SECRETS AND LIES", director: "MIKE LEIGH", rating: 8.5 },
  { title: "MEMORIES OF MURDER", director: "BONG JOON HO", rating: 8.5 },
  { title: "THE WATCHMEN", director: "DAMON LINDELOF", rating: 8.5 },
  { title: "UNDERGROUND RAILROAD", director: "BARRY JENKINS", rating: 8.5 },
  { title: "STRANGER THINGS", director: "DUFFER BROTHERS", rating: 8.5 },
  { title: "SUCCESSION", director: "JESSE ARMSTRONG", rating: 8.5 },
  { title: "THE LAST DANCE", director: "MICHAEL TOLLIN", rating: 8.5 },
  { title: "NO COUNTRY FOR OLD MEN", director: "COEN BROTHERS", rating: 8.5 },
  { title: "EXIT THROUGH THE GIFTSHOP", director: "BANKSY", rating: 8.5 },
  { title: "THE LOBSTER", director: "YORGAS LANTHIMOS", rating: 8 },
  { title: "THE FAVOURITE", director: "YORGAS LANTHIMOS", rating: 8 },
  { title: "CLOSE YOUR EYES", director: "VICTORE ERICE", rating: 8 },
  { title: "2001: A SPACE ODYSSEY", director: "STANLEY KUBRIC", rating: 8 },
  { title: "DRIVE MY CAR", director: "RYUSUKE HAMAGACHI", rating: 8 },
  { title: "MARRIAGE STORY", director: "NOAH BAUMBACH", rating: 8 },
  { title: "UNDER THE OPEN SKY", director: "MIWA NISHIKAWA", rating: 8 },
  { title: "IN BRUGES", director: "MARTIN MCDONAGH", rating: 8 },
  { title: "SHOPLIFTERS", director: "HIROKAZU KOREEDA", rating: 8 },
  { title: "I DANIEL BLAKE", director: "KEN LOACH", rating: 8 },
  { title: "RUST IN BONE", director: "JACQUES AUDIARD", rating: 8 },
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
      // Search TMDB
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
        type: mediaType === "tv" ? "film" : "film",
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

      // Small delay to avoid rate limiting
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
