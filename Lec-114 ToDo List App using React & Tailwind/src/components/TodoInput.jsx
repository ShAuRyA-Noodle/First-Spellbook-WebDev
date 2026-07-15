import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'

/**
 * The add-task row. A <form onSubmit> handles both the button click and
 * the Enter key for free — no manual onKeyDown wiring needed.
 */
function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')
  const [invalid, setInvalid] = useState(false)

  const handleChange = (e) => {
    setValue(e.target.value)
    if (invalid) setInvalid(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setInvalid(true)
      return
    }
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <motion.input
        animate={invalid ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        value={value}
        onChange={handleChange}
        type="text"
        placeholder="What needs to get done?"
        aria-label="New task"
        className={`min-w-0 flex-1 rounded-lg border bg-surface-inset px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors duration-200 placeholder:text-ink-muted ${
          invalid ? 'border-destructive/60' : 'border-line focus:border-accent/60'
        }`}
      />
      <motion.button
        whileTap={{ scale: 0.96 }}
        type="submit"
        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface-0 transition-colors duration-200 hover:bg-accent-hover"
      >
        <FiPlus size={16} strokeWidth={2.5} />
        <span className="hidden sm:inline">Add</span>
      </motion.button>
    </form>
  )
}

export default TodoInput
