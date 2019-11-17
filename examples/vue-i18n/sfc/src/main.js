import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en,
    ja,
  },
})

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')
