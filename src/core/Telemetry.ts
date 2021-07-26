import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { version } from '../../package.json'
import { Config } from './Config'
import { Log } from '~/utils'
import { isDev, isProd, isTest } from '~/env'
import { Global } from '~/extension'
import { LocaleTreeItem, ProgressSubmenuItem } from '~/views'
import { CommandOptions } from '~/commands/manipulations/common'

const HEAP_ID_DEV = '1082064308'
const HEAP_ID_PROD = '4118173713'

const HEAP_ID = isProd ? HEAP_ID_PROD : HEAP_ID_DEV

export enum TelemetryKey {
  Activated = 'activated',
  DeleteKey = 'delete_key',
  Disabled = 'disabled',
  EditKey = 'edit_key',
  EditorOpen = 'editor_open',
  Enabled = 'enabled',
  ExtractString = 'extract_string',
  ExtractStringBulk = 'extract_string_bulk',
  GoToKey = 'goto_key',
  InsertKey = 'insert_key',
  Installed = 'installed',
  NewKey = 'new_key',
  RenameKey = 'rename_key',
  ReviewAddComment = 'review_add_comment',
  ReviewApplySuggestion = 'review_apply_suggestion',
  ReviewApplyTranslation = 'review_apply_translation',
  TranslateKey = 'translate_key',
  Updated = 'updated',
  ReviewEditComment = 'review_edit_comment',
  ReviewResolveComment = 'review_resolve_comment'
}

export enum ActionSource {
  None = 'none',
  CommandPattele = 'command_pattele',
  TreeView = 'tree_view',
  Hover = 'hover',
  ContextMenu = 'context_menu',
  UiEditor = 'ui_editor',
  Review = 'review'
}

export interface TelemetryEvent {
  event: TelemetryKey
  timestamp: number
  identity: string
  properties?: Record<string, any>
}

export class Telemetry {
  private static _id: string
  private static _timer: any = null

  static events: TelemetryEvent[] = []

  static get userId() {
    if (this._id)
      return this._id
    this._id = Config.ctx.globalState.get('i18n-ally.telemetry-user-id')!
    if (!this._id) {
      this._id = uuid()
      Config.ctx.globalState.update('i18n-ally.telemetry-user-id', this._id)
    }
    Log.info(`📈 Telemetry id: ${this._id}`)

    return this._id
  }

  static checkVersionChange() {
    const previousVersion = Config.ctx.globalState.get('i18n-ally.previous-version')

    if (!previousVersion)
      Telemetry.track(TelemetryKey.Installed, { new_version: version })
    else if (previousVersion !== version)
      Telemetry.track(TelemetryKey.Updated, { new_version: version, previous_version: previousVersion })

    Config.ctx.globalState.update('i18n-ally.previous-version', version)
  }

  static get isEnabled() {
    return Config.telemetry && !isTest
  }

  static async track(key: TelemetryKey, properties?: Record<string, any>, immediate = false) {
    if (!this.isEnabled)
      return

    const event: TelemetryEvent = {
      event: key,
      identity: this.userId,
      timestamp: +new Date(),
      properties,
    }

    if (isDev)
      Log.info(`[telemetry] ${key}: ${JSON.stringify(properties)}`)

    if (immediate) {
      try {
        await axios({
          url: 'https://heapanalytics.com/api/track',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            app_id: HEAP_ID,
            ...event,
          },
        })
      }
      catch (e) {
        Log.error(e, false)
      }
    }
    else {
      this.events.push(event)
      this.schedule()
    }
  }

  static schedule() {
    if (this.events.length >= 100) {
      this.sendBulk()
    }
    else if (!this._timer && this.events.length) {
      this._timer = setInterval(
        () => this.sendBulk(),
        isDev
          ? 10 * 1000 // 10 seconds
          : 5 * 60 * 1000, // 5 minutes
      )
    }
  }

  static getActionSource(item?: LocaleTreeItem | ProgressSubmenuItem | CommandOptions) {
    return (item instanceof LocaleTreeItem || item instanceof ProgressSubmenuItem)
      ? ActionSource.TreeView
      : item?.actionSource || ActionSource.CommandPattele
  }

  static async updateUserProperties() {
    if (!this.isEnabled)
      return

    const data = {
      version,
      feature_auto_detection: !!Config.autoDetection,
      feature_annotation_in_place: !!Config.annotationInPlace,
      feature_annotations: !!Config.annotations,
      feature_disable_path_parsing: !!Config.disablePathParsing,
      feature_extract_auto_detect: !!Config.extractAutoDetect,
      feature_keep_fulfilled: !!Config.keepFulfilled,
      feature_prefer_editor: !!Config.preferEditor,
      feature_review_enabled: !!Config.reviewEnabled,
      feature_has_path_matcher: !!Config._pathMatcher,
      feature_has_custom_framework: !!Global.enabledFrameworks.find(i => i.id === 'custom'),
    }

    if (isDev)
      Log.info(`[telemetry] user: ${JSON.stringify(data)}`)

    try {
      await axios({
        url: 'https://heapanalytics.com/api/add_user_properties',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          app_id: HEAP_ID,
          identity: this.userId,
          properties: data,
        },
      })
    }
    catch (e) {
      Log.error(e, false)
    }
  }

  static async sendBulk() {
    if (!this.events.length) {
      clearInterval(this._timer)
      this._timer = null
      return
    }

    if (isDev)
      Log.info('[telemetry] sending bulk')

    const events = Array.from(this.events)
    this.events.length = 0
    try {
      await axios({
        url: 'https://heapanalytics.com/api/track',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          app_id: HEAP_ID,
          events,
        },
      })
    }
    catch (e) {
      Log.error(e, false)
    }
  }
}
