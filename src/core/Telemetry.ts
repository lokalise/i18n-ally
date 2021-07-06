import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { Config } from './Config'
import { Log } from '~/utils'

const HEAP_ID_DEV = '1082064308'
const HEAP_ID_PROD = '4118173713'

const HEAP_ID = process.env.NODE_ENV === 'production' ? HEAP_ID_PROD : HEAP_ID_DEV

export class Telemetry {
  static get userId() {
    let id = Config.ctx.globalState.get('i18n-ally.telemetry-user-id')
    if (!id) {
      id = uuid()
      Config.ctx.globalState.update('i18n-ally.telemetry-user-id', id)
    }
    return id
  }

  static async track(key: string, properties?: Record<string, string>) {
    if (!Config.telemetry)
      return

    const data = {
      app_id: HEAP_ID,
      identity: this.userId,
      event: key,
      properties,
    }

    // Log.info(`[telemetry] ${key}: ${JSON.stringify(data)}`)

    try {
      await axios({
        url: 'https://heapanalytics.com/api/track',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      })
    }
    catch (e) {
      Log.error(e)
    }
  }
}
