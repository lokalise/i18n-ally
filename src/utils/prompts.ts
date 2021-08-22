import { TextDocument, window } from 'vscode'
import { decorateLocale } from '.'
import i18n from '~/i18n'
import { CurrentFile, Config, Global, DetectionResult } from '~/core'

export async function promptEdit(keypath: string, locale: string, value?: string) {
  const result = await window.showInputBox({
    value: value?.replace(/\n/g, '\\n'),
    prompt: i18n.t('prompt.edit_key_in_locale', keypath, decorateLocale(locale)),
    ignoreFocusOut: true,
  })
  return result?.replace(/\\n/g, '\n')
}

export async function promptKeys(text: string, locale = Config.displayLanguage) {
  const result = await window.showQuickPick(
    CurrentFile.loader.keys.map(key => ({
      label: key,
      description: CurrentFile.loader.getValueByKey(key, locale, 30),
    })),
    {
      matchOnDescription: true,
      placeHolder: text,
    })
  return result?.label
}

export async function promptTemplates(keypath: string, args?: string[], doc?: TextDocument, detection?: DetectionResult) {
  const replacer = await window.showQuickPick(
    Global.interpretRefactorTemplates(keypath, args, doc, detection),
    {
      placeHolder: i18n.t('prompt.replace_text_as'),
    },
  )
  return replacer
}
