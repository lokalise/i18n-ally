import { window, DecorationOptions, Range, Disposable, workspace, ExtensionContext, TextEditorDecorationType, TextEditor } from 'vscode'
import { Global, KeyDetector, Config, Loader, CurrentFile } from '../core'
import { ExtensionModule } from '../modules'
import { getCommentState } from '../utils/shared'
import { createHover } from './hover'

const underlineDecorationType = window.createTextEditorDecorationType({
  textDecoration: 'underline',
})

export type DecorationOptionsWithGutter = DecorationOptions & {gutterType: string}

export function setDecorationsWithGutter(
  ctx: ExtensionContext,
  annotations: DecorationOptionsWithGutter[],
  editor: TextEditor,
) {
  const gutterTypes: Record<string, TextEditorDecorationType> = {
    none: window.createTextEditorDecorationType({}),
    approve: window.createTextEditorDecorationType({
      gutterIconPath: ctx.asAbsolutePath('res/dark/checkmark.svg'),
    }),
    request_change: window.createTextEditorDecorationType({
      gutterIconPath: ctx.asAbsolutePath('res/dark/review-request-change.svg'),
    }),
    comment: window.createTextEditorDecorationType({
      gutterIconPath: ctx.asAbsolutePath('res/dark/review-comment.svg'),
    }),
    conflict: window.createTextEditorDecorationType({
      gutterIconPath: ctx.asAbsolutePath('res/dark/review-conflict.svg'),
    }),
    missing: window.createTextEditorDecorationType({
      gutterIconPath: ctx.asAbsolutePath('res/dark/empty.svg'),
    }),
  }

  const dict: Record<string, DecorationOptions[]> = {
    none: [],
    approve: [],
    request_change: [],
    comment: [],
    conflict: [],
    missing: [],
  }

  for (const annotation of annotations)
    dict[annotation.gutterType].push(annotation)

    ;(Object.keys(gutterTypes))
    .forEach(k =>
      editor.setDecorations(gutterTypes[k], dict[k]),
    )
}

const annotation: ExtensionModule = (ctx) => {
  function update() {
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
    const annotations: DecorationOptionsWithGutter[] = []
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

      let gutterType = 'none'
      if (Config.reviewEnabled) {
        const comments = Global.reviews.getComments(key, Config.displayLanguage)
        gutterType = getCommentState(comments) || gutterType
      }

      annotations.push({
        range: new Range(
          document.positionAt(start - 1),
          document.positionAt(end + 1),
        ),
        renderOptions: {
          after: {
            color,
            contentText: Config.annotations ? text : '',
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
        },
        hoverMessage: createHover(key, maxLength),
        gutterType,
      })
    })

    setDecorationsWithGutter(ctx, annotations, activeTextEditor)

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
