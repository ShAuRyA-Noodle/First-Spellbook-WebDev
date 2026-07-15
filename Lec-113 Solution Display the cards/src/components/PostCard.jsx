import { estimateReadingTime, formatDispatchNumber, getAuthorAccent } from '../utils/postDisplay'

// A single "dispatch" — one JSONPlaceholder post rendered as a card.
// The left accent bar and the small dot in the header both use the same
// author-derived color, standing in for a per-author avatar.
const PostCard = ({ post }) => {
  const accentColor = getAuthorAccent(post.userId)

  return (
    <article className="post-card" style={{ '--accent-color': accentColor }}>
      <header className="post-card__header">
        <span className="post-card__author-dot" aria-hidden="true" />
        <span className="post-card__number">{formatDispatchNumber(post.id)}</span>
      </header>

      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__body">{post.body}</p>

      <footer className="post-card__footer">
        <span>Filed by Contributor #{post.userId}</span>
        <span>{estimateReadingTime(post.body)}</span>
      </footer>
    </article>
  )
}

export default PostCard
