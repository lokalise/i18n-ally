import { randomUUID } from 'crypto'
import * as amplitude from '@amplitude/analytics-node'
import { version } from '../../package.json'
import { Config } from './Config'
import { Log } from '~/utils'
import { isDev, isProd, isTest } from '~/env'
import { Global } from '~/extension'
import { LocaleTreeItem, ProgressSubmenuItem } from '~/views'
import { CommandOptions } from '~/commands/manipulations/common'

const AMPLITUDE_API = isProd
  ? '710028b04f0f9274085eec6885e94ceb' // Prod
  : '63d2a7eb46b66d43e0d20b0ba2834cc3' // Dev

const AMPLITUDE_SERVER_ZONE = 'EU'

const AMPLITUDE_FLUSH_QUEUE_SIZE = 100

const AMPLITUDE_FLUSH_INTERVAL_MILLIS = isProd
  ? 5 * 60 * 1000 // 5 minutes
  : 10 * 1000 // 10 seconds

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

export class Telemetry {
  private static _userProperties: object
  private static _amplitude: amplitude.Types.NodeClient

  static async track(key: TelemetryKey, properties?: Record<string, any>, immediate = false) {
    const isEnabled = Config.telemetry && !isTest
    if (!isEnabled)
      return

    try {
      this._initializeAmplitude()

      this._amplitude.track(key, properties, this._getUserProperties())

      if (immediate)
        this._amplitude.flush()

      if (isDev)
        Log.info(`[telemetry] ${key}: ${JSON.stringify(properties)}`)
    }
    catch (e) {
      Log.error(e, false)
    }
  }

  static getActionSource(item?: LocaleTreeItem | ProgressSubmenuItem | CommandOptions) {
    return (item instanceof LocaleTreeItem || item instanceof ProgressSubmenuItem)
      ? ActionSource.TreeView
      : item?.actionSource || ActionSource.CommandPattele
  }

  private static _initializeAmplitude() {
    if (this._amplitude)
      return

    this._amplitude = amplitude.createInstance()

    this._amplitude.init(AMPLITUDE_API, {
      optOut: !Config.telemetry || isTest,
      serverZone: AMPLITUDE_SERVER_ZONE,
      flushQueueSize: AMPLITUDE_FLUSH_QUEUE_SIZE,
      flushIntervalMillis: AMPLITUDE_FLUSH_INTERVAL_MILLIS,
    })

    this._amplitude.identify(new amplitude.Identify(), this._getUserProperties())
  }

  private static _getUserId() {
    let userId = Config.ctx.globalState.get('i18n-ally.telemetry-user-id') ?? ''
    if (!userId) {
      userId = randomUUID()
      Config.ctx.globalState.update('i18n-ally.telemetry-user-id', userId)
    }
    Log.info(`📈 Telemetry id: ${userId}`)
    return userId
  }

  private static _getUserProperties() {
    if (!this._userProperties) {
      this._userProperties = {
        user_id: this._getUserId(),
        app_version: version,
        user_properties: {
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
          feature_frameworks: Global.enabledFrameworks.map(i => i.display),
        },
      }
    }

    return this._userProperties
  }
}
