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
      const data = JSON.parse(raw.toString())
      const { _id, type, keypath, locale, items } = data

      const reply = (data: any) => {
        this.send({ ...data, _id })
      }

      switch (type) {
        case 'get_record':
          reply(loader.getRecordByKey(keypath, locale, true))
          break
        case 'set_record':
          await this.setRecords(data)
          reply({ type: 'ack' })
          break
        case 'get_records':
          reply(items.map((i: any) => loader.getRecordByKey(i.keypath, i.locale, true)))
          break
        case 'set_records':
          await this.setRecords(items)
          reply({ type: 'ack' })
          break
      }
    })

    ws.on('close', () => {
      this.log('Closed')
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

  log(msg: string) {
    ServerLog.log(`[${this.id}] ${msg}`)
  }

  send(data: any) {
    this.ws.send(JSON.stringify(data))
  }
}
