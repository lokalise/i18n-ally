import { window, DecorationOptions, Range, Disposable, TextEditorDecorationType, TextEditor, workspace, TextDocument } from 'vscode'
import throttle from 'lodash/throttle'
import { Global, KeyDetector, Config, Loader, CurrentFile, KeyUsages } from '../core'
import { ExtensionModule } from '../modules'
import { getCommentState } from '../utils/shared'
import { THROTTLE_DELAY } from '../meta'
import { createHover } from './hover'

const underlineDecorationType = window.createTextEditorDecorationType({
  textDecoration: 'underline',
})

const disappearDecorationType = window.createTextEditorDecorationType({
  textDecoration: 'none; display: none;', // a hack to inject custom style
})

export type DecorationOptionsWithGutter = DecorationOptions & {gutterType: string}

const annotation: ExtensionModule = (ctx) => {
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

  const setDecorationsWithGutter = (
    annotations: DecorationOptionsWithGutter[],
    editor: TextEditor,
  ) => {
    const dict: Record<string, DecorationOptions[]> = {
      none: [],
      approve: [],
      request_change: [],
      comment: [],
      conflict: [],
      missing: [],
    }

    for (const annotation of annotations)
      dict[annotation.gutterType].push(annotation);

    (Object.keys(gutterTypes))
      .forEach(k =>
        editor.setDecorations(gutterTypes[k], dict[k]),
      )
  }

  let _current_usages: KeyUsages | undefined
  let _current_doc: TextDocument | undefined

  function clear() {
    const editor = window.activeTextEditor
    if (editor) {
      setDecorationsWithGutter([], editor)
      editor.setDecorations(underlineDecorationType, [])
      editor.setDecorations(disappearDecorationType, [])
    }
  }

  function refresh() {
    const editor = window.activeTextEditor
    const document = editor?.document

    if (!editor || !document || _current_doc !== document)
      return

    if (!_current_usages)
      return clear()

    const loader: Loader = CurrentFile.loader
    const selection = editor.selection
    const { keys, locale, namespace, type: usageType, ranges } = _current_usages

    const annotationDelimiter = Config.annotationDelimiter
    const annotations: DecorationOptionsWithGutter[] = []
    const underlines: DecorationOptions[] = []
    const inplaces: DecorationOptions[] = []
    const maxLength = Config.annotationMaxLength

    const sourceLanguage = Config.sourceLanguage
    const showAnnotations = Config.annotations
    const annotationInPlace = Config.annotationInPlace
    const themeAnnotationMissing = Config.themeAnnotationMissing
    const themeAnnotation = Config.themeAnnotation
    const themeAnnotationBorder = Config.themeAnnotationBorder
    const themeAnnotationMissingBorder = Config.themeAnnotationMissingBorder

    const total = keys.length
    for (let i = 0; i < total; i++) {
      const key = namespace
        ? `${namespace}.${keys[i].key}`
        : keys[i].key

      const range = ranges[i]
      const rangeWithQuotes = new Range(
        range.start.with(undefined, range.start.character - 1),
        range.end.with(undefined, range.end.character + 1),
      )

      let text: string | undefined
      let missing = false
      let inplace = showAnnotations ? annotationInPlace : false
      let editing = false

      if (usageType === 'locale') {
        inplace = false
        if (locale !== sourceLanguage) {
          text = loader.getValueByKey(key, sourceLanguage, maxLength)
          // has source message but not current
          if (!loader.getValueByKey(key, locale))
            missing = true
        }
      }
      else {
        // using inplace annotation and have insection to the cursor, disabled annotation
        if (
          Config.annotationInPlace && (
            (selection.start.line <= range.start.line && range.start.line <= selection.end.line)
          || (selection.start.line <= range.end.line && range.end.line <= selection.end.line))
        ) {
          editing = true
          inplace = false
        }

        text = loader.getValueByKey(key, locale, maxLength)
        // fallback to source
        if (!text && locale !== sourceLanguage) {
          text = loader.getValueByKey(key, sourceLanguage, maxLength)
          missing = true
        }

        // the key might not exist, disabled inplace
        if (!text)
          inplace = false
      }

      if (text && !inplace)
        text = `${annotationDelimiter}${text}`

      if (editing)
        text = ''

      const color = missing
        ? themeAnnotationMissing
        : themeAnnotation

      const borderColor = missing
        ? themeAnnotationMissingBorder
        : themeAnnotationBorder

      let gutterType = 'none'
      if (missing)
        gutterType = 'missing'

      if (Config.reviewEnabled) {
        const comments = Global.reviews.getComments(key, locale)
        gutterType = getCommentState(comments) || gutterType
      }

      if (inplace) {
        inplaces.push({
          range: rangeWithQuotes,
        })
      }
      else if (usageType === 'code') {
        underlines.push({
          range,
        })
      }

      annotations.push({
        range: rangeWithQuotes,
        renderOptions: {
          after: {
            color,
            contentText: (showAnnotations && locale) ? text : '',
            fontWeight: 'normal',
            fontStyle: 'normal',
            border: inplace ? `0.5px solid ${borderColor}; border-radius: 2px;` : '',
          },
        },
        hoverMessage: createHover(key, maxLength, undefined, i),
        gutterType,
      })
    }

    setDecorationsWithGutter(annotations, editor)

    editor.setDecorations(underlineDecorationType, underlines)
    editor.setDecorations(disappearDecorationType, inplaces)
  }

  function update() {
    _current_usages = undefined
    _current_doc = undefined

    if (!Global.enabled)
      return

    const document = window.activeTextEditor?.document

    if (!document)
      return

    if (!Global.isLanguageIdSupported(document.languageId))
      return

    _current_doc = document
    _current_usages = KeyDetector.getUsages(document, CurrentFile.loader)
    refresh()
  }

  const throttledUpdate = throttle(() => update(), THROTTLE_DELAY)

  const disposables: Disposable[] = []
  CurrentFile.loader.onDidChange(throttledUpdate, null, disposables)
  window.onDidChangeActiveTextEditor(throttledUpdate, null, disposables)
  Global.reviews.onDidChange(throttledUpdate, null, disposables)
  window.onDidChangeTextEditorSelection(refresh, null, disposables)
  workspace.onDidChangeTextDocument(
    (e) => {
      if (e.document === window.activeTextEditor?.document) {
        _current_doc = undefined
        throttledUpdate()
      }
    },
    null,
    disposables,
  )

  update()

  return disposables
}

export default annotation
