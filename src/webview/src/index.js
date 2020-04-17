/* eslint-disable no-undef */
import Vue from 'vue'
import Vuex from 'vuex'
import 'vue-material-design-icons/styles.css'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import { vscode } from './api'

Vue.use(Vuex)
Vue.use(VueI18n)

const locale = 'en'
const i18n = new VueI18n({
  locale,
  messages: {},
})

const store = new Vuex.Store({
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
      },
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
      i18n.setLocaleMessage(locale, data)
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
    case 'i18n':
      store.commit('i18n', message.data)
      break
  }
})

// @ts-ignore
window.app = new Vue({
  store,
  i18n,
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
