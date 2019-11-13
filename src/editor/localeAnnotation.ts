import { window, DecorationOptions, Range, Disposable, workspace } from 'vscode'
import { Global, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { Parser } from '../parsers/Parser'
import { createHover } from './hover'

const noneDecorationType = window.createTextEditorDecorationType({})

const localeAnnotation: ExtensionModule = (ctx) => {
  const supportedParsers = Global.parsers.filter(p => p.annotationSupported)

  function update () {
    if (!Global.enabled)
      return

    const activeTextEditor = window.activeTextEditor
    if (!activeTextEditor)
      return

    const loader: Loader = CurrentFile.loader

    const document = activeTextEditor.document

    // Enable only for locale files
    if (!loader.files.includes(document.uri.fsPath))
      return

    // find matched parser
    let parser: Parser | undefined
    for (const p of supportedParsers) {
      if (p.annotationLanguageIds.includes(document.languageId)) {
        parser = p
        break
      }
    }
    if (!parser)
      return

    const annotationDelimiter = Config.annotationDelimiter
    const annotations: DecorationOptions[] = []

    const keys = parser.annotationGetKeys(document)
    // get all keys of current file
    keys.forEach(({ key, start, end }) => {
      if (Config.annotations) {
        const node = loader.getTreeNodeByKey(key)
        if (!node || node.type === 'tree')
          return
        let text = node.getValue()

        if (text)
          text = `${annotationDelimiter}${text}`

        const color = 'rgba(153, 153, 153, .7)'

        annotations.push({
          range: new Range(
            document.positionAt(start),
            document.positionAt(end),
          ),
          renderOptions: {
            after: {
              color,
              contentText: text,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
          hoverMessage: createHover(key),
        })
      }
    })

    activeTextEditor.setDecorations(noneDecorationType, annotations)
  }

  const disposables: Disposable[] = []
  disposables.push(CurrentFile.loader.onDidChange(() => update()))
  disposables.push(window.onDidChangeActiveTextEditor(() => update()))
  disposables.push(workspace.onDidChangeTextDocument(() => update()))

  update()

  return disposables
}

export default localeAnnotation
