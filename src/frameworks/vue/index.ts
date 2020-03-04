import { Framework } from '../base'
import { LanguageId } from '../../utils'

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
  keyMatchReg = [
    '(?:i18n[ (]path=|v-t=[\'"`{]|(?:this\\.|\\$|i18n\\.)(?:(?:d|n)\\(.*?,|(?:t|tc|te)\\()\\s*)[\'"`]({key})[\'"`]',
  ]

  refactorTemplates(keypath: string, languageId: string) {
    return [
      `{{$t('${keypath}')}}`,
      `this.$t('${keypath}')`,
      `$t("${keypath}")`,
      `i18n.t('${keypath}')`,
      keypath,
    ]
  }

  enableFeatures = {
    LinkedMessages: true,
  }
}

export default VueFramework
