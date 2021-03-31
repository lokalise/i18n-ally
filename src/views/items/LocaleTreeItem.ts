import { ExtensionContext, TreeItemCollapsibleState, Command } from 'vscode'
import { EditorPanel } from '../../webview/panel'
import { BaseTreeItem } from './Base'
import { decorateLocale, NodeHelper, resolveFlattenRootKeypath, ROOT_KEY, resolveFlattenRoot } from '~/utils'
import i18n from '~/i18n'
import { Node, Translator, CurrentFile, Config } from '~/core'
import { Commands } from '~/commands'

export class LocaleTreeItem extends BaseTreeItem {
  public readonly node: Node
  constructor(ctx: ExtensionContext, node: Node, public flatten = false, public readonly displayLocale?: string, public readonly listedLocales?: string[]) {
    super(ctx)

    if (node.type !== 'record')
      this.node = resolveFlattenRoot(node)
    else
      this.node = node
  }

  // @ts-expect-error
  get tooltip(): string {
    return resolveFlattenRootKeypath(this.node.keypath)
  }

  getLabel(): string {
    if (this.node.type === 'record') {
      return decorateLocale(this.node.locale)
    }
    else {
      return this.flatten
        ? resolveFlattenRootKeypath(this.node.keypath)
        : this.node.keyname === ROOT_KEY
          ? '<root>'
          : this.node.keyname
    }
  }

  // @ts-expect-error
  get collapsibleState() {
    if (this.node.type === 'record' || this.editorMode)
      return TreeItemCollapsibleState.None
    else
      return TreeItemCollapsibleState.Collapsed
  }

  set collapsibleState(_) { }

  // @ts-expect-error
  get description(): string {
    if (this.node.type === 'node')
      return this.node.getValue(this.displayLocale, true)
    if (this.node.type === 'record')
      return this.node.value
    return ''
  }

  // @ts-expect-error
  get iconPath() {
    if (Translator.isTranslating(this.node))
      return this.getIcon('loading')
    if (this.node.type === 'record') {
      return this.getFlagIcon(this.node.locale)
    }
    else if (this.node.shadow) {
      return this.getIcon('icon-unknown')
    }
    else if (this.node.type === 'tree') {
      if (this.node.isCollection)
        return this.getIcon('collection')
      else
        return this.getIcon('namespace')
    }
    else if (this.node.type === 'node') {
      if (this.description)
        return this.getIcon('string')
      else
        return this.getIcon('string-missing')
    }
  }

  // @ts-expect-error
  get contextValue() {
    const values: string[] = [this.node.type]

    if (this.node.readonly)
      values.push('readonly')
    else
      values.push('writable')

    if (NodeHelper.isOpenable(this.node))
      values.push('openable')

    if (!this.editorMode) {
      if (NodeHelper.isTranslatable(this.node))
        values.push('translatable')
      if (NodeHelper.isEditable(this.node))
        values.push('editable')
      if (this.node.type !== 'tree')
        values.push('open-in-editor')
    }

    return values.join('-')
  }

  get editorMode() {
    return this.node.type === 'node' && (Config.preferEditor || !!EditorPanel.currentPanel)
  }

  async getChildren(filter: (node: Node) => boolean = () => true) {
    if (this.editorMode)
      return []

    let nodes: Node[] = []
    if (this.node.type === 'tree')
      nodes = Object.values(this.node.children)
    else if (this.node.type === 'node')
      nodes = Object.values(CurrentFile.loader.getShadowLocales(this.node, this.listedLocales))
    const items = nodes
      .filter(filter)
      .map(node => new LocaleTreeItem(this.ctx, node, false))
    return items
  }

  // @ts-expect-error
  get command(): Command | undefined {
    if (this.editorMode) {
      return {
        command: Commands.open_in_editor,
        title: i18n.t('command.open_in_editor'),
        arguments: [this],
      }
    }
    return undefined
  }
}
