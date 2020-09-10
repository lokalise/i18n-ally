import { ExtensionContext, TreeItem, Location, Command } from 'vscode'

export class LocationTreeItem extends TreeItem {
  constructor(ctx: ExtensionContext, public readonly location: Location) {
    super(location.uri)
  }

  // @ts-expect-error
  get description() {
    return `${this.location.range.start.line + 1}:${this.location.range.start.character + 1}`
  }

  // @ts-expect-error
  get command(): Command {
    return {
      title: '',
      command: 'vscode.open',
      arguments: [
        this.location.uri,
        {
          selection: this.location.range,
        },
      ],
    }
  }
}
