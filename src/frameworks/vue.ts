import { LanguageId } from '../utils'
import { Framework } from './base'

class VueFramework extends Framework {
  id = 'vue'
  display = 'Vue'

  detection = {
    packageJSON: [
      'vue-i18n',
      'vuex-i18n',
      '@panter/vue-i18next',
      'nuxt-i18n',
    ],
  }

  languageIds: LanguageId[] = [
    'vue',
    'vue-html',
    'javascript',
    'typescript',
    'ejs',
  ]

  // for visualize the regex, you can use https://regexper.com/
  usageMatchRegex = [
    '(?:i18n[ (]path=|v-t=[\'"`{]|(?:this\\.|\\$|i18n\\.)(?:t|tc|te)\\()\\s*[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `{{$t('${keypath}')}}`,
      `this.$t('${keypath}')`,
      `$t('${keypath}')`,
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }

  enableFeatures = {
    LinkedMessages: true,
  }
}

export default VueFramework
