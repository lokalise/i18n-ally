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
      let missing = false

      let text = Global.loader.getValueByKey(key)
      // fallback to source
      if (!text && Global.displayLanguage !== Global.sourceLanguage) {
        text = Global.loader.getValueByKey(key, Global.sourceLanguage)
        missing = true
      }
      // no value on both displaying and source
      if (!text) {
        text = '🔴Not exist'
        missing = true
      }

      const end = index + match[0].length - 1
      const start = end - match[1].length
      const color = missing
        ? 'rgba(153, 153, 153, .3)'
        : 'rgba(153, 153, 153, .7)'

      annotations.push({
        range: new Range(
          document.positionAt(start - 1),
          document.positionAt(end + 1)
        ),
        renderOptions: {
          after: {
            color,
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
