import { register, init, getLocaleFromNavigator } from 'svelte-i18n'

register('en', () => import('../messages/en.json'))
register('pt-BR', () => import('../messages/pt-BR.json'))
register('es-ES', () => import('../messages/es-ES.json'))
register('ar', () => import('../messages/ar.json'))

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
})
