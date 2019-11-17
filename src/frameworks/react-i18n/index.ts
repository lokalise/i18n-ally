import { FrameworkDefinition } from '../type'

const ReactI18nFrameworkDefinition: FrameworkDefinition = {
  id: 'react-i18n',
  display: 'React i18n',

  detection: {
    packageJSON: [
      'react-i18next',
    ],
  },

  languageIds: [
    'javascript',
    'typescript',
    'tyspescriptreact',
    'typescriptreact',
  ],

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg: {
    '*': [
      // eslint-disable-next-line no-useless-escape
      /(?:Trans[ (]i18nKey=|(?:t)\()['"`]([\w\d\. -\[\]]+?)['"`]/g,
    ],
  },

  refactorTemplates: (keypath, languageId) => [
    `{t('${keypath}')}`,
    `t('${keypath}')`,
    keypath,
  ],
}

export default ReactI18nFrameworkDefinition
