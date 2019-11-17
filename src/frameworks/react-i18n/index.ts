import { FrameworkDefinition } from '../type'

const ReactFrameworkDefinition: FrameworkDefinition = {
  id: 'react',
  display: 'React',

  detection: {
    packageJSON: [
      'react-i18next',
      'react-intl',
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
      /(?:Trans[ (]i18nKey=|FormattedMessage[ (]id=|(?:t)\()['"`]([\w\d\. -\[\]]+?)['"`]/g,
    ],
  },

  refactorTemplates: (keypath, languageId) => [
    `{t('${keypath}')}`,
    `t('${keypath}')`,
    keypath,
  ],
}

export default ReactFrameworkDefinition
