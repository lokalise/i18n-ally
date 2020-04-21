import { window, Range, Disposable, workspace } from 'vscode'
import { Global, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { getCommentState } from '../utils/shared'
import { createHover } from './hover'
import { setDecorationsWithGutter, DecorationOptionsWithGutter } from './annotation'

const localeAnnotation: ExtensionModule = (ctx) => {
  const supportedParsers = Global.enabledParsers.filter(p => p.annotationSupported)

  function update() {
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

    const color = 'rgba(153, 153, 153, .7)'
    let displayLanguage = Config.displayLanguage
    if (displayLanguage === file.locale) {
      displayLanguage = Config.sourceLanguage
      if (Config.sourceLanguage === Config.displayLanguage)
        displayLanguage = ''
    }

    const maxLength = Config.annotationMaxLength
    const keys = parser.annotationGetKeys(document)

    let namespace: string | undefined

    if (Global.namespaceEnabled)
      namespace = loader.getNamespaceFromFilepath(filepath)

    const annotations: DecorationOptionsWithGutter[] = []

    // get all keys of current file
    keys.forEach(({ key, start, end }) => {
      let sourceText = ''
      let currentText = ''

      if (namespace)
        key = `${namespace}.${key}`

      const node = loader.getTreeNodeByKey(key)
      const showAnnonations = Config.annotations && displayLanguage

      if (node) {
        if (node.type !== 'node')
          return
        sourceText = node.getValue(displayLanguage)
        currentText = node.getValue(file.locale || Config.sourceLanguage)
      }

      if (sourceText) {
        if (maxLength && sourceText.length > maxLength)
          sourceText = `${sourceText.substring(0, maxLength)}…`
        sourceText = `${annotationDelimiter}${sourceText}`
      }

      let gutterType = 'none'
      if (!currentText) {
        gutterType = 'missing'
      }
      else if (Config.reviewEnabled) {
        const comments = Global.reviews.getComments(key, file.locale)
        gutterType = getCommentState(comments) || gutterType
      }

      annotations.push({
        range: new Range(
          document.positionAt(start),
          document.positionAt(end),
        ),
        renderOptions: {
          after: {
            color,
            contentText: showAnnonations ? sourceText : undefined,
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
        },
        hoverMessage: createHover(key, maxLength, file.locale),
        gutterType,
      })
    })

    setDecorationsWithGutter(ctx, annotations, activeTextEditor)
  }

  const disposables: Disposable[] = []
  disposables.push(CurrentFile.loader.onDidChange(() => update()))
  disposables.push(window.onDidChangeActiveTextEditor(() => update()))
  disposables.push(workspace.onDidChangeTextDocument(() => update()))
  disposables.push(Global.reviews.onDidChange(() => update()))

  update()

  return disposables
}

export default localeAnnotation
