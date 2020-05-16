/* eslint-disable no-case-declarations */
import http from 'http'
import WebSocket from 'ws'
import { Protocol } from '../protocol'
import { Server } from './server'
import { ServerLog } from './log'

export class Attendant {
  private protocol: Protocol

  constructor(
    public readonly server: Server,
    public readonly id: number,
    public readonly ws: WebSocket,
    public readonly request: http.IncomingMessage,
  ) {
    this.protocol = new Protocol(
      async(message) => {
        this.ws.send(JSON.stringify(message))
      },
      async(message) => {
        switch (message.type) {
          case 'ready':
            // FIXME: DEBUG
            this.protocol.editKey('title', 'en')
        }
        // Specific commands
        return undefined
      },
      {
        extendConfig: {
          extensionRoot: 'http://127.0.0.1:1897',
        },
      },
    )
    this.log(`Incoming connection from ${request.connection.remoteAddress}`)

    ws.on('message', async(raw) => {
      this.log(`Data: ${raw}`)
      this.protocol.handleMessages(JSON.parse(raw.toString()))
    })

    ws.on('close', () => {
      this.log('Closed')
      this.protocol.dispose()
    })

    this.protocol.handleMessages({ type: 'ready' })
  }

  log(msg: string) {
    ServerLog.log(`[${this.id}] ${msg}`)
  }
}
