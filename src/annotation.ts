import * as vscode from 'vscode'
import { debounce } from 'lodash'
import { KEY_REG } from './utils/KeyDetector'
import i18nFiles from './utils/i18nFiles'

const textEditorDecorationType = vscode.window.createTextEditorDecorationType(
  {}
)

function annotation(ctx: vscode.ExtensionContext) {
  function update() {
    const activeTextEditor = vscode.window.activeTextEditor
    if (!activeTextEditor) {
      return
    }

    const { document } = activeTextEditor
    const text = document.getText()
    const decorations = []

    // 从文本里遍历生成中文注释
    let match = null
    while ((match = KEY_REG.exec(text))) {
      const index = match.index
      const matchKey = match[0]
      const key = matchKey.replace(new RegExp(KEY_REG), '$1')
      const trans = i18nFiles.getTrans(document.fileName, key)

      if (!trans) {
        return
      }

      const [{ data: zhText }] = trans
      const decoration = {
        range: new vscode.Range(
          document.positionAt(index),
          document.positionAt(index + matchKey.length + 1)
        ),
        renderOptions: {
          after: {
            color: 'rgba(153, 153, 153, .7)',
            contentText: zhText ? `◽️${zhText}` : '⚠️无翻译',
            fontWeight: 'normal',
            fontStyle: 'normal'
          }
        }
      }
      decorations.push(decoration)

      activeTextEditor.setDecorations(textEditorDecorationType, decorations)
    }
  }

  const debounceUpdate = debounce(update, 500);

  [
    vscode.window.onDidChangeActiveTextEditor,
    vscode.workspace.onDidChangeTextDocument
  ].forEach((onCahnge: any) => {
    onCahnge(debounceUpdate, null, ctx.subscriptions)
  })

  update()
}

export default annotation
