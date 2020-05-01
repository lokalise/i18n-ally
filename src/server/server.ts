import http from 'http'
import path from 'path'
import WebSocket from 'ws'
import Koa from 'koa'
import KoaStatic from 'koa-static'
// @ts-ignore
import mount from 'koa-mount'
import { Config } from '../core'
import { ServerLog } from './log'
import { Attendant } from './attendant'

const PORT = 1897

export class Server {
  static _server: Server

  static get instance() {
    if (!this._server)
      this._server = new Server()
    return this._server
  }

  private launched = false
  private server!: http.Server
  private wss!: WebSocket.Server

  private attendantID = 0
  private attendants: Attendant[] = []

  async start() {
    if (this.launched)
      return
    ServerLog.log('Server starting...')
    const app = new Koa()
    this.server = http.createServer(app.callback())
    this.wss = new WebSocket.Server({ server: this.server })

    app.use(mount('/static', KoaStatic(path.join(Config.extensionPath, 'dist/server'))))

    this.wss.on('connection', (socket, request) => {
      this.attendants.push(new Attendant(this, this.attendantID++, socket, request))
    })

    this.server.listen(PORT)
    this.launched = true
    ServerLog.log(`Server stared at http://127.0.0.1:${PORT}`)
  }

  async stop() {
    if (!this.launched)
      return
    ServerLog.log('Server closing...')
    this.launched = false
    this.server.close()
    this.wss.close()
    this.attendants = []
    this.attendantID = 0
    ServerLog.log('Server closed')
  }
}
