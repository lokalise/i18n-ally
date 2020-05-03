// Protocol for exchanging data between webview/client/devtools

import { commands } from 'vscode'
import { TranslateKeys } from '../commands/manipulations'
import { EXT_ID } from '../meta'
import { CurrentFile, Global, Commands, Config } from '../core'
import i18n from '../i18n'

export interface Message {
  type: string
  _id?: number
  keypath?: string
  locale?: string
  value?: string
  route?: string
  data?: any
  commentId?: string
  items?: any[]
}

export class Protocol {
  ready = false
  pendingMessages: Message[] = []

  constructor(
    private readonly _postMessage: (message: Message) => Promise<void>,
    public extendHandler?: (message: Message) => Thenable<boolean | undefined>,
    public options?: {
      extendConfig?: any
    },
  ) {

  }

  get config() {
    const locales = Global.loader?.locales || []
    return {
      debug: Config.debug,
      review: Config.reviewEnabled,
      locales,
      flags: locales.map(i => Config.tagSystem.getFlagName(i)),
      sourceLanguage: Config.sourceLanguage,
      displayLanguage: Config.displayLanguage,
      enabledFrameworks: Config.enabledFrameworks,
      ignoredLocales: Config.ignoredLocales,
      translateOverrideExisting: Config.translateOverrideExisting,
      user: Config.reviewUser,

      ...this.options?.extendConfig,
    }
  }

  async postMessage(message: Message) {
    this.pendingMessages.push(message)
    if (this.ready) {
      const pendingMessages = this.pendingMessages
      this.pendingMessages = []
      for (const msg of pendingMessages)
        await this._postMessage(msg)
    }
  }

  updateConfig() {
    this.postMessage({
      type: 'config',
      data: this.config,
    })
  }

  updateI18nMessages() {
    this.postMessage({
      type: 'i18n',
      data: i18n.messages,
    })
  }

  async setRecords(items: any[]) {
    const loader = CurrentFile.loader
    const pendings = items.map(({ keypath, locale, value }) => {
      const record = loader.getRecordByKey(keypath, locale, true)
      return { keypath, locale, value, filepath: record?.filepath, namespace: record?.meta?.namespace }
    })
    await loader.write(pendings)
  }

  async handleMessages(message: Message) {
    const handled = this.extendHandler ? await Promise.resolve(this.extendHandler(message)) : undefined
    if (handled)
      return

    const reply = (data: any) => {
      this.postMessage({ ...data, _id: message._id })
    }

    const loader = CurrentFile.loader

    switch (message.type) {
      case 'ready':
        this.ready = true
        this.postMessage({ type: 'ready' })
        this.updateConfig()
        break

      case 'init':
        this.updateI18nMessages()
        break

      case 'get_record':
        reply(loader.getRecordByKey(message.keypath!, message.locale!, true))
        break

      case 'set_record':
        await this.setRecords([message])
        break

      case 'get_records':
        reply(message.items!.map((i: any) => loader.getRecordByKey(i.keypath, i.locale, true)))
        break

      case 'set_records':
        await this.setRecords(message.items!)
        break

      case 'translate':
        TranslateKeys(message.data)
        break

      case 'review.description':
        Global.reviews.promptEditDescription(message.keypath!)
        break

      case 'review.comment':
        Global.reviews.addComment(message.keypath!, message.locale!, message.data!)
        break

      case 'review.edit':
        Global.reviews.editComment(message.keypath!, message.locale!, message.data!)
        break

      case 'review.resolve':
        Global.reviews.resolveComment(message.keypath!, message.locale!, message.commentId!)
        break

      case 'review.apply-suggestion':
        Global.reviews.applySuggestion(message.keypath!, message.locale!, message.commentId!)
        break

      case 'open-builtin-settings':
        commands.executeCommand('workbench.extensions.action.configure', EXT_ID)
        break

      case 'open-search':
        commands.executeCommand(Commands.open_editor)
        break

      case 'translation.apply':
        Global.reviews.applyTranslationCandidate(message.keypath!, message.locale!)
        break

      case 'translation.edit':
        Global.reviews.promptEditTranslation(message.keypath, message.locale)
        break

      case 'translation.discard':
        Global.reviews.discardTranslationCandidate(message.keypath!, message.locale!)
        break
    }
  }
}
