import { window, DecorationOptions, Range, workspace } from 'vscode'
import { debounce } from 'lodash'
import { KEY_REG } from '../core/KeyDetector'
import { Common } from '../core'
import { ExtensionModule } from '../modules'

const textEditorDecorationType = window.createTextEditorDecorationType({})

const annotation: ExtensionModule = (ctx) => {
  function update () {
    const activeTextEditor = window.activeTextEditor
    if (!activeTextEditor)
      return

    const { document } = activeTextEditor
    const text = document.getText()
    const decorations: DecorationOptions[] = []

    // 从文本里遍历生成中文注释
    let match = null
    while (match = KEY_REG.exec(text)) {
      const index = match.index
      const matchKey = match[0]
      const key = matchKey.replace(new RegExp(KEY_REG), '$1')
      const trans = Common.loader.getTranslationsByKey(key)

      const text = (trans && trans.value) || ''
      const decoration: DecorationOptions = {
        range: new Range(
          document.positionAt(index),
          document.positionAt(index + matchKey.length)
        ),
        renderOptions: {
          after: {
            color: 'rgba(153, 153, 153, .7)',
            contentText: `◽️${text || '""'}`,
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
        },
      }
      decorations.push(decoration)

      activeTextEditor.setDecorations(textEditorDecorationType, decorations)
    }
  }

  const debounceUpdate = debounce(update, 500)

  window.onDidChangeActiveTextEditor(debounceUpdate, null, ctx.subscriptions)
  workspace.onDidChangeTextDocument(debounceUpdate, null, ctx.subscriptions)

  Common.loader.addEventListener('changed', update)

  update()
}

export default annotation
