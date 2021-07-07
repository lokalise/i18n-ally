import { window, DecorationOptions, Range, Disposable, TextEditorDecorationType, TextEditor, workspace, TextDocument, languages, Hover } from 'vscode'
import throttle from 'lodash/throttle'
import { getCommentState } from '../utils/shared'
import { THROTTLE_DELAY } from '../meta'
import { createHover } from './hover'
import { ExtensionModule } from '~/modules'
import { Global, KeyDetector, Config, Loader, CurrentFile, KeyUsages } from '~/core'

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
    const { keys, locale, namespace, type: usageType } = _current_usages

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
      const key = keys[i]
      const keypath = namespace
        ? `${namespace}.${key.key}`
        : key.key

      const range = new Range(
        document.positionAt(key.start),
        document.positionAt(key.end),
      )
      const rangeWithQuotes = key.quoted
        ? new Range(
          range.start.with(undefined, range.start.character - 1),
          range.end.with(undefined, range.end.character + 1),
        )
        : range

      let text: string | undefined
      let missing = false
      let inplace = showAnnotations ? annotationInPlace : false
      let editing = false

      if (usageType === 'locale') {
        inplace = false
        if (locale !== sourceLanguage) {
          text = loader.getValueByKey(keypath, sourceLanguage, maxLength)
          // has source message but not current
          if (!loader.getValueByKey(keypath, locale))
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

        text = loader.getValueByKey(keypath, locale, maxLength)
        // fallback to source
        if (!text && locale !== sourceLanguage) {
          text = loader.getValueByKey(keypath, sourceLanguage, maxLength)
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
        const comments = Global.reviews.getComments(keypath, locale)
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
            fontStyle: 'normal',
            border: inplace ? `0.5px solid ${borderColor}; border-radius: 2px;` : '',
          },
        },
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
  const throttledRefresh = throttle(() => refresh(), THROTTLE_DELAY)

  const disposables: Disposable[] = []
  CurrentFile.loader.onDidChange(throttledUpdate, null, disposables)
  Global.reviews.onDidChange(throttledUpdate, null, disposables)
  window.onDidChangeActiveTextEditor(throttledUpdate, null, disposables)
  window.onDidChangeTextEditorSelection(throttledRefresh, null, disposables)
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

  // hover
  languages.registerHoverProvider('*', {
    provideHover(document, position) {
      if (document !== _current_doc || !_current_usages)
        return

      const offset = document.offsetAt(position)
      const key = _current_usages.keys.find(k => k.start <= offset && k.end >= offset)
      if (!key)
        return

      const markdown = createHover(key.key, Config.annotationMaxLength, undefined, _current_usages.keys.indexOf(key))
      if (!markdown)
        return

      return new Hover(
        markdown,
        new Range(
          document.positionAt(key.start),
          document.positionAt(key.end),
        ))
    },
  })

  update()

  return disposables
}

export default annotation
