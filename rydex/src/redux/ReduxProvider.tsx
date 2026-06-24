'use client'
import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'

function ReduxProvider({children}:{children:ReactNode}) {
  return (
    <Provider store={store}>
        {children}
    </Provider>
  )
}

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch


export default ReduxProvider
