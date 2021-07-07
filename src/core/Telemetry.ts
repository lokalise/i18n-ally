import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { Config } from './Config'
import { Log } from '~/utils'

const HEAP_ID_DEV = '1082064308'
const HEAP_ID_PROD = '4118173713'

const HEAP_ID = process.env.NODE_ENV === 'production' ? HEAP_ID_PROD : HEAP_ID_DEV

export enum TelemetryKey {
  DeleteKey = 'delete_key',
  Disabled = 'disabled',
  EditKey = 'edit_key',
  EditorOpen = 'editor_open',
  Enabled = 'enabled',
  ExtractString = 'extract_string',
  ExtractStringBulk = 'extract_string_bulk',
  GoToKey = 'goto_key',
  InsertKey = 'insert_key',
  NewKey = 'new_key',
  RenameKey = 'rename_key',
  ReviewAddComment = 'review_add_comment',
  ReviewApplySuggestion = 'review_apply_suggestion',
  ReviewApplyTranslation = 'review_apply_translation',
  TranslateKey = 'translate_key',
}

export interface TelemetryEvent {
  event: TelemetryKey
  timestamp: number
  identity: string
  properties?: Record<string, string>
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

  static async track(key: TelemetryKey, properties?: Record<string, string>, immediate = false) {
    if (!Config.telemetry || process.env.NODE_ENV === 'test')
      return

    const event: TelemetryEvent = {
      event: key,
      identity: this.userId,
      timestamp: +new Date(),
      properties,
    }

    // Log.info(`[telemetry] ${key}: ${JSON.stringify(data)}`)

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
        Log.error(e)
      }
    }
    else {
      this.events.push(event)
      this.schedule()
    }
  }

  static schedule() {
    if (this.events.length >= 100)
      this.sendBulk()

    if (!this._timer && this.events.length) {
      this._timer = setInterval(
        () => this.sendBulk(),
        5 * 60 * 1000, // 5 minutes
      )
    }
  }

  static async sendBulk() {
    if (!this.events.length) {
      clearInterval(this._timer)
      this._timer = null
      return
    }

    const events = this.events
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
      Log.error(e)
    }
  }
}
