/* eslint-disable no-undef */
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import { vscode } from './api'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: () => {
    return Object.assign({
      ready: false,
      config: {
        sourceLanguage: 'en',
        displayLanguage: 'en',
        enabledFrameworks: [],
        ignoredLocales: [],
        extensionRoot: '',
      },
      route: 'welcome',
      routeData: {},
    },
    vscode.getState(),
    { ready: false })
  },
  mutations: {
    config(state, data) {
      state.config = data
    },
    route(state, { route, data }) {
      state.routeData = data
      state.route = route
    },
    ready(state) {
      state.ready = true
    },
  },
})

window.addEventListener('message', (event) => {
  const message = event.data
  switch (message.name) {
    case 'ready':
      store.commit('ready')
      break
    case 'config':
      store.commit('config', message.data)
      break
    case 'route':
      store.commit('route', message)
      break
  }
})

// @ts-ignore
window.app = new Vue({
  store,
  watch: {
    '$store.state': {
      deep: true,
      handler() {
        vscode.setState(this.$store.state)
      },
    },
  },
  render: createElement => createElement(App),
}).$mount('#app')

vscode.postMessage({ name: 'ready' })
