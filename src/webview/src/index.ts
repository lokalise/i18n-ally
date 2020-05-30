/* eslint-disable no-undef */
// @ts-ignore
import Vue from 'vue'
// @ts-ignore
import Vuex from 'vuex'
// @ts-ignore
import VueI18n from 'vue-i18n'
import './icons'
import { api } from './api/index'
import 'vue-material-design-icons/styles.css'
// @ts-ignore
import App from './components/App.vue'

Vue.use(Vuex)
Vue.use(VueI18n)

const locale = 'en'
const i18n = new VueI18n({
  locale,
  messages: {},
})

const store = new Vuex.Store({
  state: {
    mode: api.mode,
    ready: false,
    config: {
      debug: false,
      sourceLanguage: 'en',
      displayLanguage: 'en',
      enabledFrameworks: [],
      ignoredLocales: [],
      extensionRoot: '',
      flags: [],
      locales: [],
    },
    client: {
      ready: false,
    },
    sidebar: false,
    context: {
      standalone: false,
      keys: [],
      filepath: '',
    },
    i18n: {},
    route: 'welcome',
    routeData: {
      index: 0,
    },
    pendingChanges: [],
  },
  mutations: {
    config(state, data) {
      state.config = data
    },
    i18n(state, data) {
      state.i18n = data
      i18n.setLocaleMessage(locale, data)
    },
    route(state, { route, data }) {
      state.routeData = data
      state.route = route
    },
    context(state, context) {
      state.context = context
    },
    ready(state) {
      state.ready = true
    },
    clientReady(state, v) {
      state.client.ready = v
    },
    set(state, { key, value }) {
      Vue.set(state, key.split('.'), value)
    },
  },
})

api.server.registerListener((message) => {
  switch (message.type) {
    case 'ready':
      store.commit('ready')
      break
    case 'config':
      store.commit('config', message.data)
      break
    case 'route':
      store.commit('route', message)
      break
    case 'i18n':
      store.commit('i18n', message.data)
      break
    case 'context':
      store.commit('context', message.data)
  }
})

if (api.devtools) {
  api.devtools.registerListener((message) => {
    switch (message.type) {
      case 'devtools.ready':
        store.commit('clientReady', true)
        break
      case 'devtools.close':
        store.commit('clientReady', false)
        break
      case 'context':
        store.commit('context', message.data)
    }
  })
}

// @ts-ignore
window.app = new Vue({
  store,
  i18n,
  render: createElement => createElement(App),
}).$mount('#app')

api.server.postMessage({ type: 'ready' })
