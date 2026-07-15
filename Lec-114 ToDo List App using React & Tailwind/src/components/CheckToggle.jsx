import { motion } from 'framer-motion'

/**
 * The app's signature control: a small square, like a checkbox on a paper
 * form. Checking it doesn't just flip a background color — the tick draws
 * itself, stroke by stroke, the way a pen would tick off a line in a
 * notebook. Framer Motion's `pathLength` does the actual drawing: animating
 * it from 0 to 1 is equivalent to animating an SVG stroke-dasharray/offset
 * by hand, without the manual math.
 */
function CheckToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-colors duration-200 ${
        checked
          ? 'border-success/50 bg-success-subtle'
          : 'border-line-strong bg-transparent hover:border-accent/60'
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3 text-success" fill="none">
        <motion.path
          d="M3 8.5L6.2 11.5L13 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </button>
  )
}

export default CheckToggle
