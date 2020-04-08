import Vue from 'vue'

import Vuex from 'vuex'

import vuexI18n from 'vuex-i18n'

import translationsEn from 'i18n/en.json'
import translationsDe from 'i18n/de.json'

import Router from 'vue-router'
import { sync } from 'vuex-router-sync'
import routes from './routes.js'

import actions from './store/actions'
import mutations from './store/mutations'
import state from './store/state'

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
