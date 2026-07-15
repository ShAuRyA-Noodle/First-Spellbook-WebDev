import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter/counterSlice'
import activityLogReducer from './activityLog/activityLogSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    activityLog: activityLogReducer,
  },
})

// https://stackoverflow.com/questions/54385323/what-is-a-difference-between-action-reducer-and-store-in-redux
