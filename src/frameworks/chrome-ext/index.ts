import { Framework } from '../base'
import { LanguageId } from '../../utils'
import { RewriteKeySource, RewriteKeyContext } from '../../core/types'

class ChromeExtensionFramework extends Framework {
  id = 'chrome-ext'
  display = 'Chrome Extension'

  detection = {}

  languageIds: LanguageId[] = [
    'javascript',
    'typescript',
    'html',
  ]

  keyMatchReg = [
    /i18n\.getMessage\(\s*['"`]([[\w\d\. \-\[\]]*?)['"`]/gm,
  ]

  refactorTemplates (keypath: string, languageId: string) {
    return [
      `chrome.i18n.getMessage('${keypath}')`,
      `browser.i18n.getMessage('${keypath}')`,
      keypath,
    ]
  }

  rewriteKeys (key: string, source: RewriteKeySource, context: RewriteKeyContext = {}) {
    if (source === 'reference' && !key.endsWith('.message'))
      return `${key}.message`
    else if (source === 'source' && key.endsWith('.message'))
      return key.slice(0, -'.message'.length - 1)
    return key
  }
}

export default ChromeExtensionFramework
