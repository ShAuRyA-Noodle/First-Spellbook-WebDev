import { createContext, useContext } from "react";

/**
 * counterContext carries `{ count, setCount }` down to any descendant, no
 * matter how deeply nested, without prop drilling.
 *
 * Why the default is `null` and not `0`:
 * `createContext(0)` type-matches nothing — the Provider always supplies an
 * OBJECT (`{ count, setCount }`), so a bare number default is a trap: the
 * moment a consumer renders outside the Provider, `value` would be `0` and
 * `value.setCount` would throw "setCount is not a function". `null` is an
 * honest sentinel for "no Provider was found above me", and `useCounter()`
 * below turns that sentinel into a safe fallback instead of a crash.
 */
export const counterContext = createContext(null);

// Frozen so nobody can accidentally mutate the fallback in place.
const FALLBACK_VALUE = Object.freeze({
  count: 0,
  setCount: () => {
    if (import.meta.env?.DEV) {
      console.warn(
        "[counterContext] setCount() was called with no <counterContext.Provider> " +
          "above this component, so the update was ignored. Wrap the tree in the " +
          "Provider — see src/App.jsx."
      );
    }
  },
});

/**
 * useCounter — the one sanctioned way to read the counter context.
 *
 * Consumers never call useContext(counterContext) directly; they call this
 * hook instead. That gives us one place to guard against the "forgot the
 * Provider" pitfall: rather than handing back `null` and letting every
 * consumer independently crash on `value.count` / `value.setCount(...)`,
 * missing-Provider renders get a harmless read-only fallback plus a loud
 * dev-time warning, so the failure is visible without taking the UI down.
 */
export function useCounter() {
  const value = useContext(counterContext);
  return value ?? FALLBACK_VALUE;
}
