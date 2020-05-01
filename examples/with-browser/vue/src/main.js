import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import en from './locales/en.json'
import zhCN from './locales/zh-cn.json'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-cn': zhCN,
  },
})

Vue.config.productionTip = false

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')

window.addEventListener('load', () => {
  window.$i18nAlly.register({
    name: 'vue-i18n',
    getCurrentLocale: () => i18n.locale,
  })
})
