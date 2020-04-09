import { Framework } from './base'

class VueSFCFramework extends Framework {
  id = 'vue-sfc'
  display = 'Vue SFC'

  detection = {
    packageJSON: [
      '@kazupon/vue-i18n-loader',
    ],
  }

  languageIds = []

  keyMatchReg = []

  refactorTemplates() {
    return []
  }

  enableFeatures = {
    VueSfc: true,
  }
}

export default VueSFCFramework
