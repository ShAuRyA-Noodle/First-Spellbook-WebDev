import { useEffect, useState } from 'react'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'
import ErrorState from './ErrorState'

const POSTS_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts'
const SKELETON_COUNT = 6

// Owns the entire fetch → loading → success/error lifecycle for the post
// grid. App.jsx gives this component a fresh `key` on retry, so every retry
// is a real remount with its own clean useEffect(..., []) run — no manual
// dependency-array gymnastics needed to "fetch again".
const PostFeed = ({ onRetry }) => {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadPosts() {
      try {
        const response = await fetch(POSTS_ENDPOINT, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`The server responded with status ${response.status}.`)
        }

        const fetchedPosts = await response.json()
        setPosts(fetchedPosts)
        setStatus('success')
      } catch (error) {
        // In StrictMode's dev-only double-invoke, the first effect's cleanup
        // aborts its own in-flight request — that rejection lands here as an
        // AbortError and is expected, not a real failure, so it's ignored.
        if (error.name === 'AbortError') return

        setErrorMessage(error.message || 'Something went wrong while fetching dispatches.')
        setStatus('error')
      }
    }

    loadPosts()

    return () => controller.abort()
  }, [])

  if (status === 'loading') {
    return (
      <div className="post-grid" aria-busy="true" aria-live="polite">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={onRetry} />
  }

  if (posts.length === 0) {
    return (
      <p className="empty-state">No dispatches came back from the wire this time.</p>
    )
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export default PostFeed
