import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrash2 } from 'react-icons/fi'
import Navbar from './components/Navbar'
import TodoInput from './components/TodoInput'
import FilterTabs from './components/FilterTabs'
import TodoList from './components/TodoList'
import { useTodos } from './hooks/useTodos'

// Computed once per page load — plenty for a "today" header on a todo app.
const TODAY = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function App() {
  const { todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState('all')

  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos])
  const completedCount = todos.length - activeCount
  const counts = { all: todos.length, active: activeCount, completed: completedCount }

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar activeCount={activeCount} totalCount={todos.length} />

      <main className="mx-auto flex w-full max-w-xl flex-col px-4 py-10 sm:py-14">
        <header className="mb-7">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-tertiary">{TODAY}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            What are we getting done today?
          </h1>
        </header>

        <TodoInput onAdd={addTodo} />

        {todos.length > 0 && (
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-line-subtle">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}

        <div className="mt-6">
          <FilterTabs filter={filter} onChange={setFilter} counts={counts} />
        </div>

        <section className="mt-3 rounded-xl border border-line bg-surface-1 px-2 shadow-panel sm:px-3">
          <TodoList
            todos={visibleTodos}
            filter={filter}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        </section>

        <footer className="mt-4 flex items-center justify-between text-xs text-ink-tertiary">
          <span className="tabular-nums">
            {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
          </span>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={clearCompleted}
              className="flex items-center gap-1 rounded-md px-2 py-1 transition-colors duration-150 hover:bg-destructive-subtle hover:text-destructive"
            >
              <FiTrash2 size={12} />
              Clear completed ({completedCount})
            </button>
          )}
        </footer>
      </main>
    </div>
  )
}

export default App
