import { window, DecorationOptions, Range, workspace, Disposable } from 'vscode'
import { debounce } from 'lodash'
import { KEY_REG } from '../core/KeyDetector'
import { Global } from '../core'
import { ExtensionModule } from '../modules'

const noneDecorationType = window.createTextEditorDecorationType({})

const underlineDecorationType = window.createTextEditorDecorationType({
  textDecoration: 'underline',
})

const annotation: ExtensionModule = (ctx) => {
  function update () {
    if (!Global.enabled)
      return

    const activeTextEditor = window.activeTextEditor
    if (!activeTextEditor)
      return

    const document = activeTextEditor.document
    const text = document.getText()
    const annotations: DecorationOptions[] = []
    const underlines: DecorationOptions[] = []

    // get all keys of current file
    let match = null
    while (match = KEY_REG.exec(text)) {
      const index = match.index
      const matchKey = match[0]
      const key = matchKey.replace(new RegExp(KEY_REG), '$1')
      const trans = Global.loader.getNodeByKey(key)

      const text = (trans && trans.value) || ''

      const end = index + match[0].length - 1
      const start = end - match[1].length

      annotations.push({
        range: new Range(
          document.positionAt(start - 1),
          document.positionAt(end + 1)
        ),
        renderOptions: {
          after: {
            color: 'rgba(153, 153, 153, .7)',
            contentText: `◽️${text || '""'}`,
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
        },
      })
      underlines.push({
        range: new Range(
          document.positionAt(start),
          document.positionAt(end)
        ),
      })
    }

    activeTextEditor.setDecorations(noneDecorationType, annotations)
    activeTextEditor.setDecorations(underlineDecorationType, underlines)
  }

  const debounceUpdate = debounce(update, 500)

  const disposables: Disposable[] = []
  disposables.push(window.onDidChangeActiveTextEditor(debounceUpdate, null, ctx.subscriptions))
  disposables.push(workspace.onDidChangeTextDocument(debounceUpdate, null, ctx.subscriptions))
  disposables.push(Global.onDidChangeLoader(update))

  update()

  return disposables
}

export default annotation
