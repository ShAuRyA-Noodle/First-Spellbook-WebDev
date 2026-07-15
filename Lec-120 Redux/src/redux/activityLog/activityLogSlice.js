import { createSlice } from '@reduxjs/toolkit'
import {
  increment,
  decrement,
  incrementByAmount,
  multiply,
  reset,
} from '../counter/counterSlice'

// This slice never dispatches its own "write" actions from the UI (besides
// clearLog). Instead it listens in on the COUNTER slice's actions via
// extraReducers, and keeps its own record of what happened. Two independent
// slices reacting to one dispatched action is the same "single store, many
// subscribers" idea as Navbar + CounterPanel reading the same value — just
// applied to reducers instead of components.
const MAX_ENTRIES = 8

const initialState = {
  entries: [],
  nextId: 1,
}

function logEntry(state, action) {
  state.entries.unshift({
    id: state.nextId,
    type: action.type,
    payload: action.payload ?? null,
  })
  state.nextId += 1
  if (state.entries.length > MAX_ENTRIES) {
    state.entries.length = MAX_ENTRIES
  }
}

export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    clearLog: (state) => {
      state.entries = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(increment, logEntry)
      .addCase(decrement, logEntry)
      .addCase(incrementByAmount, logEntry)
      .addCase(multiply, logEntry)
      .addCase(reset, logEntry)
  },
})

export const { clearLog } = activityLogSlice.actions

export default activityLogSlice.reducer
