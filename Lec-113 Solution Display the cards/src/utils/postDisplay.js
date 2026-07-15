// Small, pure helpers that turn a raw JSONPlaceholder post into the display
// details the card needs. Kept separate from the components so PostCard
// stays focused on markup and these stay easy to unit test in isolation.

// A curated set of "press badge" colors. Each author (userId) is
// deterministically mapped to one, so the same author always renders with
// the same accent — a lightweight stand-in for a real avatar.
const AUTHOR_ACCENTS = [
  '#b1462b', // brick red
  '#c08a28', // ochre
  '#2f6f6b', // teal
  '#3c4a7a', // indigo
  '#6b7a3a', // olive
  '#7a3c5e', // plum
]

const WORDS_PER_MINUTE = 200

/**
 * Deterministically map a userId to one of the accent colors above, so a
 * given author always renders with the same "badge" color across cards.
 */
export function getAuthorAccent(userId) {
  const numericId = Number(userId)
  const safeId = Number.isFinite(numericId) ? Math.abs(numericId) : 0
  return AUTHOR_ACCENTS[safeId % AUTHOR_ACCENTS.length]
}

/**
 * Format a post id as a zero-padded "dispatch number", e.g. `No. 0042`.
 */
export function formatDispatchNumber(id) {
  return `No. ${String(id).padStart(4, '0')}`
}

/**
 * Rough reading-time estimate from a post body, floored at 1 minute.
 */
export function estimateReadingTime(body) {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
  return `${minutes} min read`
}
