import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import { FaEdit } from 'react-icons/fa'
import { AiFillDelete } from 'react-icons/ai'
import { v4 as uuidv4 } from 'uuid'

/* ── Squid Game geometric symbols ── */
const GEO = { circle: '○', triangle: '△', square: '□' }

/* ── Background decorations ── */
function BgGeo() {
  return (
    <div className="bg-geo">
      {/* Scanline sweep */}
      <div className="scanline-wrap">
        <div className="scanline" />
      </div>

      {/* Large outer ring */}
      <div
        className="geo-ring"
        style={{ width: 520, height: 520, top: '-80px', left: '-120px' }}
      />
      {/* Small inner ring */}
      <div
        className="geo-ring"
        style={{ width: 280, height: 280, top: '60px', left: '-30px', animationDuration: '18s' }}
      />
      {/* Teal ring bottom-right */}
      <div
        className="geo-ring geo-ring-teal"
        style={{ width: 400, height: 400, bottom: '-60px', right: '-80px' }}
      />
      {/* Teal ring small */}
      <div
        className="geo-ring geo-ring-teal"
        style={{ width: 160, height: 160, bottom: '80px', right: '60px', animationDuration: '12s' }}
      />
      {/* Triangle */}
      <div className="geo-tri" style={{ top: '40%', right: '8%' }} />
      {/* Square */}
      <div
        className="geo-sq"
        style={{ width: 180, height: 180, bottom: '15%', left: '5%', animationDelay: '-4s' }}
      />
      {/* Small square */}
      <div
        className="geo-sq"
        style={{ width: 80, height: 80, top: '20%', right: '15%', opacity: 0.08, animationDelay: '-2s' }}
      />
    </div>
  )
}

/* ── Variants ── */
const pageVariants = {
  hidden:  { opacity: 0, y: 60, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const itemVariants = {
  hidden:  { opacity: 0, x: -60, scale: 0.93 },
  visible: { opacity: 1, x: 0,   scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: 80,  scale: 0.9,
    transition: { duration: 0.25 } },
}

const sectionVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

/* ════════════════════════════════════════════════════════════ */
function App() {
  const [todo, setTodo]               = useState('')
  const [todos, setTodos]             = useState([])
  const [showFinished, setShowFinished] = useState(true)

  /* load from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('todos')
    if (stored) setTodos(JSON.parse(stored))
  }, [])

  /* fixed: always pass the updated array to avoid stale-closure bug */
  const saveToLS = (updated) => {
    localStorage.setItem('todos', JSON.stringify(updated))
  }

  const handleAdd = () => {
    if (todo.trim().length <= 3) return
    const updated = [...todos, { id: uuidv4(), todo: todo.trim(), isCompleted: false }]
    setTodos(updated)
    setTodo('')
    saveToLS(updated)
  }

  const handleEdit = (_, id) => {
    const target = todos.find(i => i.id === id)
    setTodo(target.todo)
    const updated = todos.filter(i => i.id !== id)
    setTodos(updated)
    saveToLS(updated)
  }

  const handleDelete = (_, id) => {
    const updated = todos.filter(i => i.id !== id)
    setTodos(updated)
    saveToLS(updated)
  }

  const handleCheckbox = (e) => {
    const id    = e.target.name
    const index = todos.findIndex(i => i.id === id)
    const updated = [...todos]
    updated[index] = { ...updated[index], isCompleted: !updated[index].isCompleted }
    setTodos(updated)
    saveToLS(updated)
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAdd() }

  const doneCount  = todos.filter(t => t.isCompleted).length
  const totalCount = todos.length

  return (
    <>
      <BgGeo />
      <Navbar />

      {/* ── Main Content ── */}
      <div className="relative z-10 flex justify-center px-4 py-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="squid-card w-full max-w-lg rounded-2xl p-6 md:p-8"
          style={{ minHeight: '82vh' }}
        >

          {/* ── Header ── */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6, ease: 'backOut' }}
          >
            {/* Symbol trio */}
            <div className="flex justify-center items-center gap-5 mb-4">
              {[
                { sym: GEO.circle,   color: 'rgba(240,240,240,0.35)', delay: 0.3 },
                { sym: GEO.triangle, color: '#ff2d78',                 delay: 0.45 },
                { sym: GEO.square,   color: '#00ffcc',                 delay: 0.6 },
              ].map(({ sym, color, delay }) => (
                <motion.span
                  key={sym}
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.4 }}
                  style={{ color, fontSize: '1.6rem', lineHeight: 1 }}
                >
                  {sym}
                </motion.span>
              ))}
            </div>

            <h1
              className="neon-text font-black tracking-widest"
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                color: '#f0f0f0',
                animation: 'flicker 10s infinite',
              }}
            >
              iTASK
            </h1>
            <p
              className="section-label mt-1"
              style={{ color: 'rgba(255,45,120,0.65)' }}
            >
              PLAYER TASK MANAGEMENT SYSTEM
            </p>
          </motion.div>

          {/* ── Add Task Panel ── */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.45 }}
            className="mb-5 p-4 rounded-xl"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,45,120,0.18)',
            }}
          >
            <p
              className="section-label mb-3"
              style={{ color: '#ff2d78' }}
            >
              ▶ ADD TASK
            </p>

            <div className="flex gap-2">
              <input
                className="squid-input flex-1 rounded-lg px-4 py-2 text-sm"
                type="text"
                placeholder="Enter your task…"
                value={todo}
                onChange={e => setTodo(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                onClick={handleAdd}
                disabled={todo.trim().length <= 3}
                whileHover={todo.trim().length > 3 ? { scale: 1.05 } : {}}
                whileTap={todo.trim().length > 3 ? { scale: 0.95 } : {}}
                className="squid-btn-primary px-5 py-2 rounded-lg text-sm"
              >
                SAVE
              </motion.button>
            </div>
          </motion.div>

          {/* ── Filter row ── */}
          <motion.div
            className="flex items-center gap-3 mb-4 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            {/* custom toggle */}
            <div
              className={`toggle-track ${showFinished ? 'on' : 'off'}`}
              onClick={() => setShowFinished(v => !v)}
            >
              <div className="toggle-thumb" />
            </div>
            <span className="text-sm" style={{ color: 'rgba(240,240,240,0.6)' }}>
              Show Completed
            </span>
            {/* progress counter */}
            <span
              className="ml-auto text-xs font-mono"
              style={{ color: 'rgba(0,255,204,0.55)' }}
            >
              {doneCount} / {totalCount} DONE
            </span>
          </motion.div>

          {/* progress bar */}
          {totalCount > 0 && (
            <motion.div
              className="mb-4 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #ff2d78, #00ffcc)',
                  boxShadow: '0 0 8px #ff2d78',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / totalCount) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          )}

          <div className="neon-divider mb-5" />

          {/* ── Tasks List ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <p
              className="section-label mb-4"
              style={{ color: '#00ffcc' }}
            >
              ▶ YOUR TASKS
            </p>

            <div
              className="space-y-2 overflow-y-auto pr-1"
              style={{ maxHeight: '42vh' }}
            >
              {/* Empty state */}
              {todos.filter(t => showFinished || !t.isCompleted).length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-12"
                  style={{ color: 'rgba(240,240,240,0.18)' }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{GEO.circle}</span>
                  <p className="section-label mt-3">NO TASKS REMAINING</p>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {todos.map((item, index) =>
                  (showFinished || !item.isCompleted) ? (
                    <motion.div
                      key={item.id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={`todo-row flex items-center justify-between p-3 ${
                        item.isCompleted ? 'done-task' : 'active-task'
                      }`}
                    >
                      {/* Left section */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Player number */}
                        <span className="player-num">
                          {String(index + 1).padStart(3, '0')}
                        </span>

                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          name={item.id}
                          checked={item.isCompleted}
                          onChange={handleCheckbox}
                          className="w-4 h-4 flex-shrink-0"
                        />

                        {/* Task text */}
                        <motion.span
                          animate={{
                            color: item.isCompleted
                              ? 'rgba(240,240,240,0.25)'
                              : 'rgba(240,240,240,0.9)',
                          }}
                          transition={{ duration: 0.3 }}
                          className="text-sm truncate"
                          style={{
                            textDecoration: item.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {item.todo}
                        </motion.span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 ml-3 flex-shrink-0">
                        <motion.button
                          onClick={e => handleEdit(e, item.id)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-md"
                          style={{
                            background: 'rgba(255,45,120,0.12)',
                            border: '1px solid rgba(255,45,120,0.25)',
                            color: '#ff2d78',
                          }}
                          title="Edit task"
                        >
                          <FaEdit size={11} />
                        </motion.button>

                        <motion.button
                          onClick={e => handleDelete(e, item.id)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-md"
                          style={{
                            background: 'rgba(255,23,68,0.1)',
                            border: '1px solid rgba(255,23,68,0.25)',
                            color: '#ff1744',
                          }}
                          title="Delete task"
                        >
                          <AiFillDelete size={11} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Footer ── */}
          <motion.div
            className="mt-6 pt-4 text-center"
            style={{ borderTop: '1px solid rgba(255,45,120,0.08)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div
              className="flex justify-center gap-8 text-xs font-mono"
              style={{ color: 'rgba(240,240,240,0.12)', letterSpacing: '0.15em' }}
            >
              <span>{GEO.circle} CIRCLE</span>
              <span style={{ color: 'rgba(255,45,120,0.2)' }}>{GEO.triangle} TRIANGLE</span>
              <span style={{ color: 'rgba(0,255,204,0.2)' }}>{GEO.square} SQUARE</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </>
  )
}

export default App
