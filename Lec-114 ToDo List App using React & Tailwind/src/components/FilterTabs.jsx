import { motion } from 'framer-motion'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

/**
 * A segmented control. Only the active button ever renders the pill
 * (`motion.span` with `layoutId="filter-pill"`) — Framer Motion notices the
 * element moved to a new position in the tree and glides it there instead
 * of popping, which is what makes the highlight look like it slides.
 */
function FilterTabs({ filter, onChange, counts }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-inset p-1">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={filter === key}
          className="relative rounded-md px-3 py-1.5 text-xs font-medium"
        >
          {filter === key && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 rounded-md border border-accent/40 bg-accent-subtle"
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            />
          )}
          <span
            className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
              filter === key ? 'text-accent' : 'text-ink-tertiary hover:text-ink-secondary'
            }`}
          >
            {label}
            <span className="tabular-nums text-[10px] opacity-70">{counts[key]}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default FilterTabs
