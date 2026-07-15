import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// No <React.StrictMode> here on purpose: StrictMode double-invokes render
// (and effects) in development, which would double the Navbar render count
// on every commit and muddy the exact "1 click = N renders" story this demo
// is built to show. Safe to add back for a non-demo project.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
