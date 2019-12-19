import { Framework } from '../base'
import { LanguageId } from '../../utils'

class PhpJoomlaFramework extends Framework {
  id= 'php-joomla'
  display= 'Joomla'

  detection = {
    composerJSON: [
      'joomla/application',
    ],
  }

  languageIds: LanguageId[] = [
    'php',
  ]

  // for visualize the regex, you can use https://regexper.com/
  keyMatchReg = [
    /J?Text::(?:_|[\w]+)\(['"]([\w\d\. \-\[\]]*?)['"]/g,
  ]

  refactorTemplates (keypath: string) {
    return [
      `JText::_('${keypath}')`,
      keypath,
    ]
  }
}

export default PhpJoomlaFramework
