/* eslint-disable no-case-declarations */
import http from 'http'
import WebSocket from 'ws'
import { CurrentFile } from '../core'
import { Server } from './server'
import { ServerLog } from './log'

export class Attendant {
  constructor(
    public readonly server: Server,
    public readonly id: number,
    public readonly ws: WebSocket,
    public readonly request: http.IncomingMessage,
  ) {
    this.log(`Incoming connection from ${request.connection.remoteAddress}`)
    this.send({ type: 'ready', msg: 'Hi' })

    ws.on('message', async(raw) => {
      this.log(`Data: ${raw}`)

      const loader = CurrentFile.loader
      const { _id, type, keypath, locale, value } = JSON.parse(raw.toString())

      const reply = (data: any) => {
        this.send({ ...data, _id })
      }

      switch (type) {
        case 'get_record':
          reply(loader.getRecordByKey(keypath, locale, true))
          break
        case 'set_record':
          const record = loader.getRecordByKey(keypath, locale, true)
          await loader.write({ keypath, locale, value, filepath: record?.filepath, namespace: record?.meta?.namespace })
          reply({ type: 'ack' })
          break
      }
    })

    ws.on('close', () => {
      this.log('Closed')
    })
  }

  log(msg: string) {
    ServerLog.log(`[${this.id}] ${msg}`)
  }

  send(data: any) {
    this.ws.send(JSON.stringify(data))
  }
}
