const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>React Router Lab &mdash; Lecture 115</p>
        <p className="footer-stack">React 18 &middot; React Router 6 &middot; Vite</p>
        <p>&copy; {year}</p>
      </div>
    </footer>
  )
}

export default Footer
