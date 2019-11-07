import { env } from 'vscode'
import en from '../package.nls.json'
import zhcn from '../package.nls.zh-cn.json'

export type i18nMessage = typeof en
export type i18nKeys = keyof i18nMessage

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class i18n {
  static readonly messages: Record<string, Record<string, string>> = {
    en,
    'zh-cn': zhcn,
  }

  static get language () {
    return env.language.toLocaleLowerCase()
  }

  static get fallbackMessages () {
    return this.messages.en
  }

  static get currentMessages () {
    return this.messages[this.language] || this.fallbackMessages
  }

  static format (str: string, args: any[]) {
    return str.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined'
        ? args[number].toString()
        : match
    })
  }

  static t (key: i18nKeys, ...args: any[]) {
    let text = this.currentMessages[key] || this.fallbackMessages[key]

    if (args && args.length)
      text = this.format(text, args)

    return text
  }
}
