import { FrameworkDefinition } from '../type'

const i18nextFrameworkDefinition: FrameworkDefinition = {
  id: 'i18next',
  display: 'General i18next ',

  detection: {
    packageJSON: (packages: string[]) => {
      return packages.includes('i18next') && ['react-i18n'].every(v => !packages.includes(v))
    },
  },

  languageIds: [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
  ],

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg: {
    '*': [],
  },

  refactorTemplates: (keypath, languageId) => [
    keypath,
  ],
}

export default i18nextFrameworkDefinition
