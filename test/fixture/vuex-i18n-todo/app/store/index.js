import Vue from 'vue'
import Vuex from 'vuex'

// import the initial state definition
import initialState from './state'

// import all mutations that are allowed to change the store
import mutations from './mutations'

// import all actions available to the components
import actions from './actions'

// make vuex methods available to all vue components
Vue.use(Vuex)

// initialize a new store
// note: use vuex-modules for specific functionality
const store = new Vuex.Store({
  state: initialState,
  mutations,
  actions,
  strict: process.env.NODE_ENV !== 'production',
})

// add hot-load capabilities for actions, mutations and modules
if (module.hot) {
  // accept actions and mutations as hot modules
  module.hot.accept(['./mutations', './actions'], () => {
    // require the updated modules
    // have to add .default here due to babel 6 module output
    const newMutations = require('./mutations').default
    const newActions = require('./actions').default

    // swap in the new actions and mutations
    store.hotUpdate({
      mutations: newMutations,
      actions: newActions,
    })
  })
}

export default store
