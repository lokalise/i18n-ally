import { FluentBundle } from '@fluent/bundle'
import { createFluentVue } from 'fluent-vue'

const bundle = new FluentBundle('en')

export const fluent = createFluentVue({
  locale: 'en',
  bundles: [bundle],
})
