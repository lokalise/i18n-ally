import Vue from 'vue'

import { fluent } from './fluent'
import App from './App.vue'

Vue.use(fluent)

new Vue({
  el: '#root',
  render: (h) => h(App),
})
