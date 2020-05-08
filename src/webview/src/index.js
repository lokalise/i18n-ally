/* eslint-disable no-undef */
import Vue from 'vue'
import Vuex from 'vuex'
import 'vue-material-design-icons/styles.css'
import VueI18n from 'vue-i18n'
import VCheck from 'vue-material-design-icons/Check.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'
import VCommentOutline from 'vue-material-design-icons/CommentOutline.vue'
import VEarth from 'vue-material-design-icons/Earth.vue'
import VCommentEditOutline from 'vue-material-design-icons/CommentEditOutline.vue'
import VCommentQuestionOutline from 'vue-material-design-icons/CommentQuestionOutline.vue'
import VCheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'
import VPencilOff from 'vue-material-design-icons/PencilOff.vue'
import VPencil from 'vue-material-design-icons/Pencil.vue'
import VCheckAll from 'vue-material-design-icons/CheckAll.vue'
import VMenu from 'vue-material-design-icons/Menu.vue'
import VChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import VChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import VDeleteEmptyOutline from 'vue-material-design-icons/DeleteEmptyOutline.vue'
import VFormatQuoteOpen from 'vue-material-design-icons/FormatQuoteOpen.vue'
import { api, mode } from './api'
import App from './App.vue'

Vue.component('VCheck', VCheck)
Vue.component('VPlusMinus', VPlusMinus)
Vue.component('VCommentOutline', VCommentOutline)
Vue.component('VEarth', VEarth)
Vue.component('VCommentEditOutline', VCommentEditOutline)
Vue.component('VCommentQuestionOutline', VCommentQuestionOutline)
Vue.component('VCheckboxMarkedOutline', VCheckboxMarkedOutline)
Vue.component('VPencilOff', VPencilOff)
Vue.component('VPencil', VPencil)
Vue.component('VCheckAll', VCheckAll)
Vue.component('VDeleteEmptyOutline', VDeleteEmptyOutline)
Vue.component('VFormatQuoteOpen', VFormatQuoteOpen)
Vue.component('VMenu', VMenu)
Vue.component('VChevronLeft', VChevronLeft)
Vue.component('VChevronRight', VChevronRight)

Vue.use(Vuex)
Vue.use(VueI18n)

const locale = 'en'
const i18n = new VueI18n({
  locale,
  messages: {},
})

function initTheme() {
  if (mode === 'webview')
    return
  const theme = {
    foreground: 'white',
    'editor-foreground': 'white',
    background: '#222',
    'editor-background': '#222',
    'font-family': '-apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif',
    'editor-font-family': 'monospace',
  }
  const css = []
  for (const key of Object.keys(theme))
    css.push(`--vscode-${key}:${theme[key]}`)

  const style = document.createElement('style')
  style.innerHTML = `:root{${css.join(';')}}`
  document.head.appendChild(style)
}

initTheme()

const store = new Vuex.Store({
  state: () => {
    return Object.assign({
      mode,
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
    context(state, context) {
      state.context = context
    },
    ready(state) {
      state.ready = true
    },
  },
})

api.registerListener((message) => {
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
window.app = new Vue({
  store,
  i18n,
  render: createElement => createElement(App),
}).$mount('#app')

api.postMessage({ type: 'ready' })
