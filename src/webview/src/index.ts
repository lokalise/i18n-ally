/* eslint-disable no-undef */
import { createApp, h } from 'vue'
import { createStore } from 'vuex'
import { createI18n } from 'vue-i18n'
import { vscode } from './api'
import App from './App.vue'

const app = createApp({
  watch: {
    '$store.state': {
      deep: true,
      handler() {
        vscode.setState(this.$store.state)
      },
    },
  },
  render: () => h(App),
})

const locale = 'en'
const i18n = createI18n({
  locale,
  messages: {},
})

const store = createStore({
  state: () => {
    return Object.assign({
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
      context: {},
      i18n: {},
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
    i18n(state, data) {
      state.i18n = data
      i18n.global.setLocaleMessage(locale, data)
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
  },
})

app.use(i18n)
app.use(store)

window.addEventListener('message', (event) => {
  const message = event.data
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

// @ts-ignore
window.app = app

app.mount('#app')

vscode.postMessage({ type: 'ready' })
