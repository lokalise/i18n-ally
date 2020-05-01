import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import en from './locales/en.json'
import zhCN from './locales/zh-cn.json'

Vue.use(VueI18n)
Vue.config.productionTip = false

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-cn': zhCN,
  },
})

const script = document.createElement('script')
script.setAttribute('src', 'http://127.0.0.1:1897/static/client.js')
script.setAttribute('type', 'module')
document.head.appendChild(script)
window.addEventListener('i18n-ally-ready', () => {
  window.dispatchEvent(new CustomEvent('i18n-ally-register', { detail: { name: 'vue-i18n', instance: i18n } }))
})

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')

window.Vue = Vue
