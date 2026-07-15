import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import CheckToggle from './CheckToggle'

const rowVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.18, ease: 'easeIn' } },
}

/** A single row: the signature checkbox, the task text (or an edit field), and actions. */
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const startEditing = () => {
    setDraft(todo.text)
    setIsEditing(true)
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) onEdit(todo.id, trimmed)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setDraft(todo.text)
    setIsEditing(false)
  }

  return (
    <motion.li
      layout
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group flex items-center gap-3 border-b border-line-subtle px-1 py-3 last:border-b-0"
    >
      <CheckToggle
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'done'}`}
      />

      {isEditing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') cancelEdit()
          }}
          onBlur={commitEdit}
          className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface-inset px-2 py-1 text-sm text-ink-primary outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={startEditing}
          title="Double-click to edit"
          className={`min-w-0 flex-1 truncate text-left text-sm transition-colors duration-200 ${
            todo.completed ? 'text-ink-muted line-through' : 'text-ink-primary'
          }`}
        >
          {todo.text}
        </button>
      )}

      <div className="flex flex-shrink-0 items-center gap-1 opacity-70 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={commitEdit}
              aria-label="Save task"
              className="rounded-md p-1.5 text-success hover:bg-success-subtle"
            >
              <FiCheck size={14} />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              aria-label="Cancel editing"
              className="rounded-md p-1.5 text-ink-tertiary hover:bg-surface-2"
            >
              <FiX size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              aria-label="Edit task"
              className="rounded-md p-1.5 text-ink-tertiary transition-colors duration-150 hover:bg-accent-subtle hover:text-accent"
            >
              <FiEdit2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete task"
              className="rounded-md p-1.5 text-ink-tertiary transition-colors duration-150 hover:bg-destructive-subtle hover:text-destructive"
            >
              <FiTrash2 size={13} />
            </button>
          </>
        )}
      </div>
    </motion.li>
  )
}

export default TodoItem
