export async function searchBooks(query: string) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
  );
  const data = await res.json();
  return data.items || [];
}
