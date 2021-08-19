import { parse, serialize, FluentSerializer, Message, Pattern, Identifier, Entry } from '@fluent/syntax'
import { Parser } from './base'
import { File } from '~/utils'

export class FluentParser extends Parser {
  id = 'ftl'
  serializer: FluentSerializer

  constructor() {
    super(['ftl'], 'ftl')

    this.serializer = new FluentSerializer()
  }

  getText(entry: Message): string {
    entry.comment = null
    return this.serializer.serializeEntry(entry).substring(entry.id.name.length + 3)
  }

  async parse(text: string) {
    const data = parse(text, { withSpans: false }).body
      .map((entry: Entry) => entry instanceof Message
        ? [
          entry.id.name,
          this.getText(entry),
        ]
        : undefined)
      .filter(Boolean) as string[][]

    return Object.fromEntries(data)
  }

  async dump(): Promise<string> {
    throw new Error('Not implemented')
  }

  async save(filepath: string, object: Record<string, string>) {
    const currentFile = await File.read(filepath)
    const currentResourse = parse(currentFile, { withSpans: true })

    for (const [key, value] of Object.entries(object)) {
      const resourceString = `${key} = ${value}`
      const resource = parse(resourceString, { withSpans: false })

      let updated = false
      for (const message of currentResourse.body) {
        if (message instanceof Message && message.id.name === key) {
          updated = true
          message.value = resource.body[0].value as Pattern
        }
      }

      if (!updated) {
        const newMessage = new Message(
          new Identifier(key),
          resource.body[0].value as Pattern)
        currentResourse.body.push(newMessage)
      }
    }

    const text = serialize(currentResourse, { withJunk: true })
    await File.write(filepath, text)
  }
}
