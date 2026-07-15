import { motion } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'

/**
 * Sticky top bar. It doesn't hold decorative nav links to nowhere — this is
 * a single-page app, so instead the right side does real work: a live
 * status pill fed by props from App, reflecting the actual task count.
 */
function Navbar({ activeCount, totalCount }) {
  const allDone = totalCount > 0 && activeCount === 0

  let statusLabel = `${activeCount} left`
  if (totalCount === 0) statusLabel = 'No tasks yet'
  else if (allDone) statusLabel = 'All done'

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-20 border-b border-line-subtle bg-surface-0/85 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-accent/30 bg-accent-subtle text-accent">
            <FiCheck size={14} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink-primary">iTask</span>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors duration-300 ${
            allDone ? 'border-success/40 bg-success-subtle text-success' : 'border-line text-ink-tertiary'
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </motion.nav>
  )
}

export default Navbar
