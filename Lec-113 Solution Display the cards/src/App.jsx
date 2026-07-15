import { useState } from 'react'
import Navbar from './components/Navbar'
import PostFeed from './components/PostFeed'
import './App.css'

function App() {
  // Bumping this number gives <PostFeed> a new `key`, which forces React to
  // unmount the old instance and mount a brand-new one — a clean way to
  // "retry" a failed fetch without threading extra dependencies through
  // useEffect.
  const [feedAttempt, setFeedAttempt] = useState(0)

  const handleRetry = () => setFeedAttempt((previousAttempt) => previousAttempt + 1)

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page__intro">
          <h2 className="page__heading">Front Page</h2>
          <span className="page__count">jsonplaceholder.typicode.com/posts</span>
        </div>
        <PostFeed key={feedAttempt} onRetry={handleRetry} />
      </main>
    </>
  )
}

export default App
