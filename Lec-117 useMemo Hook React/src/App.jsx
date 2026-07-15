import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

/* ---------------------------------------------------------------------------
 * "Expensive work" simulation
 *
 * Nothing here runs at module scope. The old version of this demo built a
 * 30,000,000-element array the moment the file was imported, which delayed
 * the very first paint before React had rendered anything at all. Every
 * dataset below is built lazily, inside the component, inside useMemo — so
 * the initial paint is instant and the "expensive" cost only ever happens
 * when a control that's supposed to trigger it is actually used.
 * ------------------------------------------------------------------------- */

const DATASET_PRESETS = [
  { id: 'light', label: 'Light', size: 500_000, feel: 'barely felt' },
  { id: 'medium', label: 'Medium', size: 2_000_000, feel: 'a small hitch' },
  { id: 'heavy', label: 'Heavy', size: 6_000_000, feel: 'unmistakable lag' },
]

// Deterministic per-item "cost" standing in for real work (parsing, hashing,
// formatting…). It exists so the scan cost is controllable and doesn't
// depend on how aggressively a given JS engine can optimize a bare
// comparison loop.
const WORK_ITERATIONS = 40

// How many render "ticks" the waveform strip remembers.
const TRACE_LENGTH = 60

function churn(seed) {
  let x = seed | 0
  for (let i = 0; i < WORK_ITERATIONS; i++) {
    x = (Math.imul(x, 1103515245) + 12345) | 0
  }
  return x
}

/** Builds the haystack. The "magical" item sits near the tail so a linear
 *  scan pays almost the full cost — that's the whole point of the demo.
 *  `nonce` nudges exactly where, so "Regenerate dataset" produces a
 *  genuinely different array (and a genuinely new reference) each time. */
function buildDataset(size, nonce) {
  const jitter = (nonce % 5) * 0.01
  const magicIndex = Math.max(0, Math.floor(size * (0.9 + jitter)) - 1)
  const data = new Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = { index: i, isMagical: i === magicIndex }
  }
  return data
}

/** The expensive computation: a deliberately linear scan with per-item work.
 *  Returns `undefined` if nothing matches — callers must guard for that. */
function findMagicalItem(dataset) {
  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i]
    churn(item.index)
    if (item.isMagical === true) return item
  }
  return undefined
}

function formatMs(ms) {
  return `${ms.toFixed(1)}\u00A0ms`
}

/* ---------------------------------------------------------------------------
 * Presentational bits
 * ------------------------------------------------------------------------- */

function StatCard({ label, value, sublabel, tone }) {
  const toneClass = tone ? ` stat-card--${tone}` : ''
  return (
    <div className={`stat-card${toneClass}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {sublabel ? <span className="stat-card__sublabel">{sublabel}</span> : null}
    </div>
  )
}

function Waveform({ trace }) {
  return (
    <div
      className="waveform"
      role="img"
      aria-label={`Render trace, most recent ${trace.length} renders. Cool green bars are cache hits that skipped the expensive scan. Hot amber bars are renders that recomputed it.`}
    >
      {trace.length === 0 ? (
        <p className="waveform__empty">Interact with a control to start the trace…</p>
      ) : (
        trace.map((entry) => (
          <span
            key={entry.id}
            className={`waveform__bar waveform__bar--${entry.recomputed ? 'hot' : 'cool'}`}
            style={{ height: `${entry.recomputed ? Math.min(100, 14 + entry.ms) : 6}%` }}
            title={entry.recomputed ? `Recomputed in ${formatMs(entry.ms)}` : 'Cache hit — skipped the scan'}
          />
        ))
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * App
 * ------------------------------------------------------------------------- */

function App() {
  const renderStartedAt = performance.now()

  const [presetId, setPresetId] = useState('light')
  const [datasetNonce, setDatasetNonce] = useState(0)
  const [memoEnabled, setMemoEnabled] = useState(true)
  const [pulse, setPulse] = useState(0)
  const [clock, setClock] = useState(() => new Date())
  const [animate, setAnimate] = useState(false)
  const [frameTick, setFrameTick] = useState(0)
  const [resetTick, setResetTick] = useState(0)

  const preset = DATASET_PRESETS.find((p) => p.id === presetId) ?? DATASET_PRESETS[0]
  const datasetSize = preset.size

  // --- unrelated re-render source #1: an ambient clock, ticking on its own ---
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // --- unrelated re-render source #2: an opt-in animation loop (rAF) ---
  useEffect(() => {
    if (!animate) return undefined
    let frameId
    const tick = () => {
      setFrameTick((t) => t + 1)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [animate])

  // --- the "expensive" dataset — built lazily inside useMemo, never at module scope ---
  const { dataset, buildMs } = useMemo(() => {
    const start = performance.now()
    const data = buildDataset(datasetSize, datasetNonce)
    return { dataset: data, buildMs: performance.now() - start }
  }, [datasetSize, datasetNonce])

  // --- instrumentation refs -----------------------------------------------
  // These are mutated during render on purpose: they exist only to make
  // memoization *visible* for the lesson (render counts, recompute counts,
  // a scrolling trace). Real components should treat render as pure — this
  // is deliberately-impure teaching instrumentation, not a pattern to copy.
  const renderCount = useRef(0)
  const memoComputeCount = useRef(0)
  const naiveComputeCount = useRef(0)
  const traceRef = useRef([])
  const traceIdRef = useRef(0)
  const prevRenderAtRef = useRef(null)

  renderCount.current += 1

  const memoCountBefore = memoComputeCount.current
  const memoized = useMemo(() => {
    memoComputeCount.current += 1
    const start = performance.now()
    const result = findMagicalItem(dataset)
    return { result, ms: performance.now() - start }
  }, [dataset])
  const memoDidRecompute = memoComputeCount.current !== memoCountBefore

  let active
  let recomputedThisRender
  if (memoEnabled) {
    active = memoized
    recomputedThisRender = memoDidRecompute
  } else {
    naiveComputeCount.current += 1
    const start = performance.now()
    const result = findMagicalItem(dataset)
    active = { result, ms: performance.now() - start }
    recomputedThisRender = true
  }

  traceIdRef.current += 1
  traceRef.current = [
    ...traceRef.current.slice(-(TRACE_LENGTH - 1)),
    { id: traceIdRef.current, ms: active.ms, recomputed: recomputedThisRender },
  ]

  const recomputeCount = memoEnabled ? memoComputeCount.current : naiveComputeCount.current
  const hitRate =
    renderCount.current > 0
      ? Math.round(((renderCount.current - recomputeCount) / renderCount.current) * 100)
      : 0

  // FPS is only meaningful while the animation loop is driving renders — it
  // measures the real gap between successive App() renders.
  let fps = null
  if (animate && prevRenderAtRef.current !== null) {
    const delta = renderStartedAt - prevRenderAtRef.current
    if (delta > 0) fps = Math.min(999, Math.round(1000 / delta))
  }
  prevRenderAtRef.current = renderStartedAt

  const totalRenderMs = performance.now() - renderStartedAt

  function handlePresetChange(id) {
    setPresetId(id)
  }

  function handleModeKeyDown(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    setMemoEnabled((enabled) => !enabled)
  }

  function handlePresetKeyDown(event, index) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const dir = event.key === 'ArrowRight' ? 1 : -1
    const next = DATASET_PRESETS[(index + dir + DATASET_PRESETS.length) % DATASET_PRESETS.length]
    setPresetId(next.id)
  }

  function handleRegenerate() {
    setDatasetNonce((n) => n + 1)
  }

  function handlePulse() {
    setPulse((p) => p + 1)
  }

  function handleResetStats() {
    renderCount.current = 0
    memoComputeCount.current = 0
    naiveComputeCount.current = 0
    traceRef.current = []
    traceIdRef.current = 0
    prevRenderAtRef.current = null
    setResetTick((t) => t + 1)
  }

  const modeTone = memoEnabled ? 'cool' : 'hot'

  return (
    <div className="app">
      <header className="app__header">
        <p className="eyebrow">React · useMemo</p>
        <h1>useMemo Lab</h1>
        <p className="lede">
          A linear scan over a huge array, wired to two things that shouldn&apos;t affect it. Flip the
          switch and watch whether the scan actually reruns.
        </p>
      </header>

      <main className="layout">
        {/* ---------------------------------------------------------- controls */}
        <section className="panel controls" aria-label="Demo controls">
          <div className="control-block">
            <h2 className="control-block__title">Mode</h2>
            <div className="mode-switch" role="radiogroup" aria-label="Memoization mode">
              <button
                type="button"
                role="radio"
                aria-checked={memoEnabled}
                className={`mode-switch__option mode-switch__option--cool${memoEnabled ? ' is-active' : ''}`}
                onClick={() => setMemoEnabled(true)}
                onKeyDown={handleModeKeyDown}
              >
                <span className="mode-switch__dot" aria-hidden="true" />
                Memoized
                <span className="mode-switch__hint">useMemo(fn, [dataset])</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!memoEnabled}
                className={`mode-switch__option mode-switch__option--hot${!memoEnabled ? ' is-active' : ''}`}
                onClick={() => setMemoEnabled(false)}
                onKeyDown={handleModeKeyDown}
              >
                <span className="mode-switch__dot" aria-hidden="true" />
                Naive
                <span className="mode-switch__hint">recomputes every render</span>
              </button>
            </div>
            <pre className="code-peek" translate="no">
              {memoEnabled
                ? 'const magical = useMemo(() => findMagicalItem(dataset), [dataset])'
                : 'const magical = findMagicalItem(dataset) // no memo — runs every render'}
            </pre>
          </div>

          <div className="control-block">
            <h2 className="control-block__title">Dataset — The Real Dependency</h2>
            <div className="segmented" role="radiogroup" aria-label="Dataset size">
              {DATASET_PRESETS.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={p.id === presetId}
                  className={`segmented__option${p.id === presetId ? ' is-active' : ''}`}
                  onClick={() => handlePresetChange(p.id)}
                  onKeyDown={(event) => handlePresetKeyDown(event, index)}
                >
                  {p.label}
                  <span className="segmented__hint">{p.feel}</span>
                </button>
              ))}
            </div>
            <div className="control-row">
              <button type="button" className="btn" onClick={handleRegenerate}>
                Regenerate Dataset
              </button>
              <span className="control-row__note">
                {datasetSize.toLocaleString()} items · built in {formatMs(buildMs)}
              </span>
            </div>
          </div>

          <div className="control-block">
            <h2 className="control-block__title">Unrelated Re-Renders</h2>
            <div className="control-row">
              <button type="button" className="btn" onClick={handlePulse}>
                Pulse ({pulse})
              </button>
              <span className="control-row__note" aria-label={`Clock, updates every second: ${clock.toLocaleTimeString()}`}>
                {clock.toLocaleTimeString()}
              </span>
            </div>
            <div className="control-row">
              <button
                type="button"
                role="switch"
                aria-checked={animate}
                className={`btn btn--toggle${animate ? ' is-active' : ''}`}
                onClick={() => setAnimate((a) => !a)}
              >
                {animate ? 'Stop' : 'Run'} Animation Stress Test
              </button>
              {animate ? (
                <span className="control-row__note">
                  {fps !== null ? `${fps}\u00A0fps` : 'measuring…'} · frame {frameTick}
                </span>
              ) : (
                <span className="control-row__note">~60 renders/sec when running</span>
              )}
            </div>
            {animate ? (
              <div className="marquee" aria-hidden="true">
                <span className="marquee__dot" style={{ left: `${frameTick % 100}%` }} />
              </div>
            ) : null}
          </div>

          <div className="control-block control-block--reset">
            <button type="button" className="btn btn--ghost" onClick={handleResetStats}>
              Reset Session Stats
            </button>
          </div>
        </section>

        {/* ----------------------------------------------------------- readout */}
        <section className="panel readout" aria-label="Live readout">
          <div className={`signal signal--${modeTone}`}>
            <span className={`signal__badge signal__badge--${modeTone}`}>
              {memoEnabled ? 'MEMOIZED' : 'NAIVE'}
            </span>
            {/* Only the found value is announced — it changes rarely (preset/regenerate),
                unlike the timing line below it, which changes on every render and would
                spam a screen reader if it were also live. */}
            <div aria-live="polite">
              {active.result ? (
                <p className="signal__value">
                  Magical index <strong>{active.result.index.toLocaleString()}</strong>
                </p>
              ) : (
                <p className="signal__value signal__value--empty">
                  No magical item in this dataset — try regenerating.
                </p>
              )}
            </div>
            <p className="signal__meta">
              last scan took {formatMs(active.ms)}
              {recomputedThisRender ? ' (just now)' : ' (cached result)'}
            </p>
          </div>

          <div className="stat-grid" key={resetTick}>
            <StatCard label="Renders" value={renderCount.current} />
            <StatCard
              label="Expensive recomputes"
              value={recomputeCount}
              tone={modeTone}
            />
            <StatCard label="Cache hit rate" value={`${hitRate}%`} tone={modeTone} />
            <StatCard label="This render" value={formatMs(totalRenderMs)} />
          </div>

          <div className="waveform-block">
            <div className="waveform-block__legend">
              <span className="legend legend--cool">
                <span className="legend__swatch" aria-hidden="true" /> cache hit
              </span>
              <span className="legend legend--hot">
                <span className="legend__swatch" aria-hidden="true" /> recomputed
              </span>
            </div>
            <Waveform trace={traceRef.current} />
          </div>
        </section>
      </main>

      <footer className="app__footer">
        <p>
          React.StrictMode double-invokes renders in development to surface impure code, so counts
          above run roughly 2× what you&apos;d see in a production build — the ratio between renders
          and recomputes is what matters, not the raw numbers.
        </p>
        <p className="app__footer-credit">Vite + React 18</p>
      </footer>
    </div>
  )
}

export default App
