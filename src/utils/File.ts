import { normalize } from 'path'
import { readFileSync, writeFileSync, promises as fsPromises } from 'fs'
import * as iconv from 'iconv-lite'
import * as jschardet from 'jschardet'
// import { Log } from './Log'
import { Config } from '../core'

interface IFileEncoding extends Record<string, string> {}
interface IDecodeData {
  encoding: string,
  content: string
}

export class File {
  private static _fileEncoding: IFileEncoding = {}

  private static __setFileEncoding(filepath: string, encoding: string) {
    filepath = normalize(filepath)
    this._fileEncoding[filepath] = encoding
  }

  private static __getFileEncoding(filepath: string, opts?: any): string {
    let encoding

    switch (typeof opts) {
      case 'object':
        encoding = opts.encoding
        break
      case 'string':
        encoding = opts
        break
    }

    if (!encoding) {
      filepath = normalize(filepath)
      encoding = this._fileEncoding[filepath]
    }

    if (!encoding && Config.encoding !== 'auto')
      encoding = Config.encoding

    return encoding
  }

  static async read(filepath: string, encoding: string = Config.encoding): Promise<string> {
    const raw = await fsPromises.readFile(filepath)
    const res = File.decode(raw, encoding)
    this.__setFileEncoding(filepath, res.encoding)
    return res.content
  }

  static readSync(filepath: string, encoding: string = Config.encoding): string {
    const raw = readFileSync(filepath)
    const res = File.decode(raw, encoding)
    this.__setFileEncoding(filepath, res.encoding)
    return res.content
  }

  static async write(filepath: string, data: any, opts?: any) {
    const encoding = this.__getFileEncoding(filepath, opts)
    const buffer = new Buffer(File.encode(data, encoding))
    await fsPromises.writeFile(filepath, buffer)
  }

  static writeSync(filepath: string, data: any, opts?: any) {
    const encoding = this.__getFileEncoding(filepath, opts)
    const content = File.encode(data, encoding)
    writeFileSync(filepath, content)
  }

  static decode(buffer: Buffer, encoding?: string): IDecodeData {
    if (!encoding || encoding === 'auto') {
      const res = jschardet.detect(buffer)
      // Log.info(JSON.stringify(res))
      encoding = res.encoding
    }

    return {
      encoding: encoding,
      content: iconv.decode(buffer, encoding)
    }
  }

  static encode(string: string, encoding: string, addBom: boolean = true): Buffer {
    return iconv.encode(string, encoding, {
      addBOM: addBom
    })
  }
}
