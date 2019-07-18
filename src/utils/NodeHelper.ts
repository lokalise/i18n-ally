import { Node, Config } from '../core'

export class NodeHelper {
  static isSource (node: Node) {
    if (node.type === 'record')
      return node.locale === Config.sourceLanguage
    return false
  }

  static hasFilepath (node: Node) {
    if (node.type === 'record')
      return !!node.filepath
    return false
  }

  static notShadowOrHasFilepath (node: Node) {
    return !node.shadow || this.hasFilepath(node)
  }

  static isTranslatable (node: Node) {
    return !node.readonly
      && !this.isSource(node)
      && node.type !== 'tree'
      && this.notShadowOrHasFilepath(node)
  }

  static isOpenable (node: Node) {
    return node.type !== 'tree'
      && this.notShadowOrHasFilepath(node)
  }

  static isEditable (node: Node) {
    return !node.readonly && node.type !== 'tree'
  }
}
