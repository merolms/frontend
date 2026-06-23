// @ts-nocheck
// Unsplash API Service
// Uses the Unsplash API to search and fetch images.
// Requires VITE_UNSPLASH_ACCESS_KEY in .env (get one at https://unsplash.com/developers)
// Falls back to Unsplash Source (no key needed) if no API key is configured.

const UNSPLASH_API = "https://api.unsplash.com";
const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "";

/**
 * Search Unsplash photos
 * @param {string} query - Search term
 * @param {number} page - Page number (1-based)
 * @param {number} perPage - Results per page (max 30)
 * @returns {Promise<{ results: Array, total: number, total_pages: number }>}
 */
export const searchUnsplash = async (query, page = 1, perPage = 12) => {
  if (!ACCESS_KEY) {
    // Fallback: use Unsplash Source (no API key needed, but no real search)
    // Returns a deterministic set of images based on the query seed
    return fallbackSearch(query, page, perPage);
  }

  const params = new URLSearchParams({
    query: query || "course education",
    page: String(page),
    per_page: String(perPage),
    orientation: "landscape",
    content_filter: "high",
  });

  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    results: data.results.map(normalizePhoto),
    total: data.total,
    total_pages: data.total_pages,
  };
};

/**
 * Get a single random photo (used as fallback)
 */
export const getRandomUnsplash = async (query = "education") => {
  if (!ACCESS_KEY) {
    return {
      id: `fallback-${Date.now()}`,
      url: `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`,
      thumb: `https://source.unsplash.com/400x225/?${encodeURIComponent(query)}`,
      author: "Unsplash",
      profile: "https://unsplash.com",
      download: "",
    };
  }

  const res = await fetch(
    `${UNSPLASH_API}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
    { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
  );

  if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
  const data = await res.json();
  return normalizePhoto(data);
};

// ─── Helpers ──────────────────────────────────────────────────

const normalizePhoto = (photo) => ({
  id: photo.id,
  url: photo.urls.regular, // ~1080w
  fullUrl: photo.urls.full, // original
  thumb: photo.urls.small, // ~400w
  download: photo.links.download,
  author: photo.user.name,
  profile: photo.user.links.html,
  profileImage: photo.user.profile_image?.small || "",
  alt: photo.alt_description || photo.description || "Unsplash image",
  color: photo.color || "#4060e0",
  width: photo.width,
  height: photo.height,
});

// Fallback when no API key: use picsum.photos with seed-based determinism
const fallbackSearch = (query, page, perPage) => {
  const seedBase = hashString(query || "education");
  const results = [];
  for (let i = 0; i < perPage; i++) {
    const idx = (page - 1) * perPage + i;
    const seed = seedBase + idx;
    results.push({
      id: `fallback-${seed}`,
      url: `https://picsum.photos/seed/${seed}/800/450`,
      fullUrl: `https://picsum.photos/seed/${seed}/1600/900`,
      thumb: `https://picsum.photos/seed/${seed}/400/225`,
      download: "",
      author: "Lorem Picsum",
      profile: "https://picsum.photos",
      profileImage: "",
      alt: `${query || "education"} - image ${idx + 1}`,
      color: "#999999",
      width: 800,
      height: 450,
    });
  }
  return { results, total: 100, total_pages: 9 };
};

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};
