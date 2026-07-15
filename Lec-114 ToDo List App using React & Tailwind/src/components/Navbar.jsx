import { motion } from 'framer-motion'

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-3"
      style={{
        background: 'rgba(8, 8, 15, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 45, 120, 0.2)',
        boxShadow: '0 0 30px rgba(255, 45, 120, 0.07)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        {/* Squid Game symbol trio (mini) */}
        <div className="flex items-center gap-1.5">
          <span style={{ color: 'rgba(240,240,240,0.4)', fontSize: '0.85rem' }}>○</span>
          <span style={{ color: '#ff2d78',              fontSize: '0.85rem' }}>△</span>
          <span style={{ color: '#00ffcc',              fontSize: '0.85rem' }}>□</span>
        </div>

        <motion.span
          className="font-black tracking-widest"
          style={{
            fontSize: '1.25rem',
            color: '#f0f0f0',
            textShadow: '0 0 10px rgba(255,45,120,0.5)',
          }}
          animate={{
            textShadow: [
              '0 0 8px rgba(255,45,120,0.4)',
              '0 0 18px rgba(255,45,120,0.8)',
              '0 0 8px rgba(255,45,120,0.4)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          iTASK
        </motion.span>
      </div>

      {/* Nav links */}
      <ul className="flex gap-6">
        {[
          { label: 'HOME',  color: 'rgba(255,45,120,0.7)' },
          { label: 'TASKS', color: 'rgba(0,255,204,0.7)'  },
        ].map(({ label, color }) => (
          <motion.li
            key={label}
            whileHover={{ color, scale: 1.05 }}
            className="cursor-pointer text-xs font-bold tracking-widest transition-colors"
            style={{ color: 'rgba(240,240,240,0.4)' }}
          >
            {label}
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}

export default Navbar
