import { AnimatePresence } from 'framer-motion'
import TodoItem from './TodoItem'
import EmptyState from './EmptyState'

/** Renders the visible (already-filtered) todos, or an empty state if there are none. */
function TodoList({ todos, filter, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return <EmptyState filter={filter} />
  }

  return (
    <ul className="flex flex-col">
      <AnimatePresence initial={false} mode="popLayout">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </AnimatePresence>
    </ul>
  )
}

export default TodoList
