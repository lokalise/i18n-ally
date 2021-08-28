import { Framework } from './base'

class FluentVueSFCFramework extends Framework {
  id = 'fluent-vue-sfc'
  display = 'fluent-vue SFC'

  detection = {
    packageJSON: [
      'fluent-vue-loader',
    ],
  }

  languageIds = []

  usageMatchRegex = []

  refactorTemplates() {
    return []
  }

  enableFeatures = {
    FluentVueSfc: true,
  }
}

export default FluentVueSFCFramework
