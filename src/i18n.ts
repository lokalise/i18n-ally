import { env } from 'vscode'
import en from '../package.nls.json'
import zhcn from '../package.nls.zh-cn.json'
import zhtw from '../package.nls.zh-tw.json'
import nlnl from '../package.nls.nl-nl.json'
import jajp from '../package.nls.ja-jp.json'
import nbno from '../package.nls.nb-no.json'
import frfr from '../package.nls.fr-fr.json'
import ptbr from '../package.nls.pt-br.json'

// eslint-disable-next-line @typescript-eslint/class-name-casing
export default class i18n {
  static readonly messages: Record<string, Record<string, string>> = {
    en,
    'zh-cn': zhcn,
    'zh-tw': zhtw,
    'nl-nl': nlnl,
    'ja-jp': jajp,
    'nb-no': nbno,
    'fr-fr': frfr,
    'pt-br': ptbr,
  }

  static language = env.language.toLocaleLowerCase()
  static fallbackMessages = i18n.messages.en
  static currentMessages = i18n.messages[i18n.language]
  static current: Record<string, string> = {}

  static _init() {
    Object.keys(this.fallbackMessages)
      .forEach((key) => {
        this.current[key] = this.currentMessages[key] || this.fallbackMessages[key]
      })
  }

  static format(str: string, args: any[]) {
    return str.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined'
        ? args[number].toString()
        : match
    })
  }

  static t(key: string, ...args: any[]) {
    let text = this.current[key]

    if (args && args.length)
      text = this.format(text, args)

    return text
  }
}

i18n._init()
