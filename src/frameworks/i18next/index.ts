import { Framework } from '../base'

class I18nextFramework extends Framework {
  id ='i18next'
  display = 'i18next'

  detection = {
    packageJSON: (packages: string[]) => {
      return packages.includes('i18next') && ['react-i18n'].every(v => !packages.includes(v))
    },
  }

  languageIds = [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
  ]

  keyMatchReg = {
    '*': [],
  }

  refactorTemplates (keypath: string) {
    return [
      keypath,
    ]
  }
}

export default I18nextFramework
