// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import Reactotron from './ReactotronConfig'

import * as Sentry from '@sentry/browser'
import { Provider } from 'react-redux'
import { Reducers } from './_redux/reducers/root_reducer'
import { applyMiddleware, compose, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { persistReducer, persistStore } from 'redux-persist'

// import { reduxBatch } from '@manaflair/redux-batch'
import { rootEpic } from './_redux/epics/root_epics'
import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'
// import registerServiceWorker, { unregister } from './registerServiceWorker'
// import { composeWithDevTools } from 'redux-devtools-extension';
import { GIT_HASH } from './_utils/const'
import { PersistGate } from 'redux-persist/integration/react'
import { createFilter } from 'redux-persist-transform-filter'
import {
  notificationsMiddleWare,
  poolCalculateValueMiddleWare,
  poolsCachingMiddleWare,
  relayActionsMiddleWare
} from './_redux/middlewares'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
// import reduxImmutableStateInvariant from 'redux-immutable-state-invariant'
import storage from 'redux-persist/lib/storage'

import './index.module.css'

function noop() {}

const epicMiddleware = createEpicMiddleware()

const middlewares = [
  epicMiddleware,
  relayActionsMiddleWare,
  notificationsMiddleWare,
  poolCalculateValueMiddleWare,
  poolsCachingMiddleWare
]

if (process.env.NODE_ENV === `development`) {
  middlewares.push(require('redux-immutable-state-invariant').default())
}

// Redux Persist
const saveSubsetFilterEndpoint = createFilter('endpoint', [
  'endpointInfo',
  'networkInfo'
])
const saveSubsetFilterApp = createFilter('app', [
  // 'isConnected',
  // 'isSyncing',
  'lastBlockNumberUpdate',
  'accountsAddressHash',
  'config'
])
const saveSubsetFilterTransactionsDrago = createFilter('transactionsDrago', [
  'holder',
  'manager'
])

//   const saveSubsetBlacklistFilter = createBlacklistFilter(
//     'endpoint',
//     ['accounts']
//   );

const persistConfig = {
  key: 'rigoblock',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['endpoint', 'app', 'user', 'transactionsDrago'],
  transforms: [
    saveSubsetFilterEndpoint,
    saveSubsetFilterApp,
    saveSubsetFilterTransactionsDrago
    // saveSubsetFilterApp
    // saveSubsetBlacklistFilter
  ]
}
const persistedReducer = persistReducer(persistConfig, Reducers.rootReducer)

let composeEnhancers
if (process.env.NODE_ENV === `development`) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
} else {
  composeEnhancers = compose
}

// TO DO: test batch action dispatch
// const enhancer = compose(
//   reduxBatch,
//   applyMiddleware(...middlewares),
//   reduxBatch
// )
const enhancer = composeEnhancers(applyMiddleware(...middlewares))

let store
if (process.env.NODE_ENV !== 'development') {
  console.log = noop
  console.warn = noop
  console.error = noop
  Sentry.init({
    dsn: 'https://8f6eb496a745453aaffe29e7e78273fc@o432218.ingest.sentry.io/5384582',
    environment: process.env.NODE_ENV,
    release: 'webapp-v1@' + GIT_HASH
  })
}

if (process.env.NODE_ENV === `development`) {
  // Sentry.init({
  //   dsn: 'https://8f6eb496a745453aaffe29e7e78273fc@o432218.ingest.sentry.io/5384582',
  //   environment: process.env.NODE_ENV
  // })
  store = Reactotron.createStore(persistedReducer, enhancer)
} else {
  store = createStore(persistedReducer, enhancer)
}

epicMiddleware.run(rootEpic)

let persistor = persistStore(store)

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)

// if (process.env.NODE_ENV === 'development') {
//   // registerServiceWorker()
// }
// unregister()

// Hot Module Reload
if (module.hot) {
  module.hot.accept()
}
