import Vue from 'vue'

// use vuex for state management
import Vuex from 'vuex'

// initilialize a new vuex store
import state from './store/state'
import mutations from './store/mutations'
import actions from './store/actions'

// initialize the vuex-i18 module
import vuexI18n from 'vuex-i18n'

// import predefined localizations
import translationsEn from 'i18n/en.json'
import translationsDe from 'i18n/de.json'

// use vue-router for navigation
import Router from 'vue-router'
import routes from './routes.js'

// synchronize the router with vuex
import { sync } from 'vuex-router-sync'

// import the main app component
import App from './app.vue'
Vue.use(Vuex)

const store = new Vuex.Store({
  state,
  mutations,
  actions,
})
Vue.use(vuexI18n.plugin, store)

// add translations
Vue.i18n.add('en', translationsEn)
Vue.i18n.add('de', translationsDe)

// default locale is english
Vue.i18n.set('en')

// make the router components and methods available to all vue components
Vue.use(Router)

// initialize a new router
const router = new Router({
  mode: 'history',
  routes,
})
sync(store, router)

// initialize the application
// eslint-disable-next-line no-new
new Vue({
  router,
  store,
  el: '#app',
  render: h => h(App),
})
