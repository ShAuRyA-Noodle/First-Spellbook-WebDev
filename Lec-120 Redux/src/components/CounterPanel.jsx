import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  decrement,
  increment,
  incrementByAmount,
  multiply,
  reset,
} from '../redux/counter/counterSlice'
import { usePulse } from '../hooks/usePulse'
import { formatNumber } from '../utils/formatNumber'

const CounterPanel = () => {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  const pulsing = usePulse(count)

  const [amount, setAmount] = useState(5)
  const [error, setError] = useState(null)
  const amountInputRef = useRef(null)

  const handleAmountSubmit = (event) => {
    event.preventDefault()
    const parsed = Number(amount)

    if (!Number.isFinite(parsed) || parsed === 0) {
      setError('Enter a non-zero number to dispatch incrementByAmount.')
      amountInputRef.current?.focus()
      return
    }

    setError(null)
    dispatch(incrementByAmount(parsed))
  }

  return (
    <section className="panel counter-panel" aria-labelledby="counter-panel-heading">
      <header className="panel__header">
        <div>
          <p className="panel__eyebrow">Transmitter · dispatches actions</p>
          <h2 id="counter-panel-heading" className="panel__title">
            Control Desk
          </h2>
        </div>
        <span className="panel__tag" translate="no">
          counter
        </span>
      </header>

      <div className={`counter-panel__readout${pulsing ? ' is-pulsing' : ''}`}>
        <span className="counter-panel__value" aria-live="polite" aria-atomic="true">
          {formatNumber(count)}
        </span>
        <span className="counter-panel__value-caption" translate="no">
          state.counter.value
        </span>
      </div>

      <div className="counter-panel__row" role="group" aria-label="Adjust counter by one">
        <button
          type="button"
          className="btn btn--negative"
          onClick={() => dispatch(decrement())}
          aria-label="Decrement counter by 1"
        >
          <span aria-hidden="true">&minus;</span>
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => dispatch(reset())}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => dispatch(multiply())}
          aria-label="Double the counter"
        >
          &times;2
        </button>
        <button
          type="button"
          className="btn btn--positive"
          onClick={() => dispatch(increment())}
          aria-label="Increment counter by 1"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <form className="counter-panel__amount" onSubmit={handleAmountSubmit} noValidate>
        <label className="counter-panel__amount-label" htmlFor="amount-input" translate="no">
          incrementByAmount(payload)
        </label>
        <div className="counter-panel__amount-controls">
          <input
            id="amount-input"
            name="amount"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            className="input"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              if (error) setError(null)
            }}
            aria-describedby={error ? 'amount-hint amount-error' : 'amount-hint'}
            aria-invalid={error ? 'true' : undefined}
            ref={amountInputRef}
          />
          <button type="submit" className="btn btn--accent">
            Add Amount
          </button>
        </div>
        <p id="amount-hint" className="counter-panel__amount-hint">
          Sends <code translate="no">incrementByAmount({amount || 0})</code> —
          the payload travels with the action.
        </p>
        {error && (
          <p id="amount-error" className="counter-panel__amount-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}

export default CounterPanel
