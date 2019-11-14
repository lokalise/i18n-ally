import { window, DecorationOptions, Range, Disposable, workspace } from 'vscode'
import { Global, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
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
    const filepath = document.uri.fsPath
    const file = loader.files.find(f => f.filepath === filepath)
    if (!file)
      return

    // find matched parser
    const parser = supportedParsers.find(p => p.annotationLanguageIds.includes(document.languageId))
    if (!parser)
      return

    const annotationDelimiter = Config.annotationDelimiter
    const annotations: DecorationOptions[] = []
    const color = 'rgba(153, 153, 153, .7)'
    let displayLanguage = Config.displayLanguage
    if (displayLanguage === file.locale) {
      displayLanguage = Config.sourceLanguage
      if (Config.sourceLanguage === Config.displayLanguage)
        displayLanguage = ''
    }

    const maxLength = Config.annotationMaxLength
    const keys = parser.annotationGetKeys(document)
    // get all keys of current file
    keys.forEach(({ key, start, end }) => {
      if (Config.annotations) {
        let text = ''

        if (Config.annotations && displayLanguage) {
          const node = loader.getTreeNodeByKey(key)
          if (!node || node.type === 'tree')
            return
          text = node.getValue(displayLanguage)

          if (text) {
            if (maxLength && text.length > maxLength)
              text = `${text.substring(0, maxLength)}…`
            text = `${annotationDelimiter}${text}`
          }
        }

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
          hoverMessage: createHover(key, maxLength),
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
