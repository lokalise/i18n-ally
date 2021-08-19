import { parse, Resource, serialize, FluentSerializer, Message } from '@fluent/syntax'
import { Parser } from './base'

export class FluentParser extends Parser {
  id = 'ftl'
  serializer: FluentSerializer

  constructor() {
    super(['ftl'], 'ftl')

    this.serializer = new FluentSerializer()
  }

  getText(entry: Message): string {
    return this.serializer.serializeEntry(entry).replace(`${entry.id.name} = `, '')
  }

  async parse(text: string) {
    const data = parse(text, { withSpans: false }).body
      .map((entry: any) => [
        entry.id.name,
        this.getText(entry),
      ])

    return Object.fromEntries(data)
  }

  async dump(object: Resource) {
    return serialize(object, {})
  }
}
