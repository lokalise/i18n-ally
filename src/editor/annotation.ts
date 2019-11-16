import { window, DecorationOptions, Range, Disposable, workspace } from 'vscode'
import { Global, KeyDetector, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { createHover } from './hover'

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
    if (!Global.isLanguageIdSupported(document.languageId))
      return

    const annotationDelimiter = Config.annotationDelimiter

    const loader: Loader = CurrentFile.loader
    const annotations: DecorationOptions[] = []
    const underlines: DecorationOptions[] = []
    const maxLength = Config.annotationMaxLength

    const keys = KeyDetector.getKeys(document)
    // get all keys of current file
    keys.forEach(({ key, start, end }) => {
      underlines.push({
        range: new Range(
          document.positionAt(start),
          document.positionAt(end),
        ),
      })

      if (Config.annotations) {
        let missing = false

        let text = loader.getValueByKey(key, undefined, maxLength)
        // fallback to source
        if (!text && Config.displayLanguage !== Config.sourceLanguage) {
          text = loader.getValueByKey(key, Config.sourceLanguage, maxLength)
          missing = true
        }

        if (text)
          text = `${annotationDelimiter}${text}`

        const color = missing
          ? 'rgba(153, 153, 153, .3)'
          : 'rgba(153, 153, 153, .7)'

        annotations.push({
          range: new Range(
            document.positionAt(start - 1),
            document.positionAt(end + 1),
          ),
          renderOptions: {
            after: {
              color,
              contentText: text,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
          hoverMessage: createHover(key, maxLength),
        })
      }
    })

    activeTextEditor.setDecorations(noneDecorationType, annotations)
    activeTextEditor.setDecorations(underlineDecorationType, underlines)
  }

  const disposables: Disposable[] = []
  disposables.push(CurrentFile.loader.onDidChange(() => update()))
  disposables.push(window.onDidChangeActiveTextEditor(() => update()))
  disposables.push(workspace.onDidChangeTextDocument(() => update()))

  update()

  return disposables
}

export default annotation
