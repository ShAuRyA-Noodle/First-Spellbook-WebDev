// A shimmering placeholder that mirrors the shape of a real PostCard, shown
// while the initial fetch is in flight. Purely decorative, so it is hidden
// from assistive tech — the parent grid announces the busy/live state.
const PostCardSkeleton = () => (
  <div className="post-card post-card--skeleton" aria-hidden="true">
    <div className="skeleton-line skeleton-line--tag" />
    <div className="skeleton-line skeleton-line--title" />
    <div className="skeleton-line skeleton-line--title is-short" />
    <div className="skeleton-line skeleton-line--body" />
    <div className="skeleton-line skeleton-line--body" />
    <div className="skeleton-line skeleton-line--body is-short" />
    <div className="skeleton-line skeleton-line--footer" />
  </div>
)

export default PostCardSkeleton
