import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'todos'

/**
 * Reads and validates whatever is in localStorage before it ever touches
 * React state. localStorage can hand back null (nothing saved yet), or a
 * string a user/extension hand-edited into garbage — both would throw (or
 * silently produce nonsense) if we handed them straight to JSON.parse.
 */
function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Saved todos were corrupted, starting with an empty list.', error)
    return []
  }
}

/**
 * Owns the todo list end-to-end: state, localStorage persistence, and every
 * mutation. Every update uses the `prev => ...` functional form, so each
 * handler always works off the latest state — even if several fire in the
 * same tick — instead of a value captured in a stale closure.
 */
export function useTodos() {
  const [todos, setTodos] = useState(loadTodos)

  // Persist on every change. Because `todos` starts from `loadTodos()`
  // above (a lazy initializer), this never fires with a half-loaded list.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: uuidv4(), text, completed: false }])
  }, [])

  const editTodo = useCallback((id, text) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text } : t)))
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed))
  }, [])

  return { todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted }
}
