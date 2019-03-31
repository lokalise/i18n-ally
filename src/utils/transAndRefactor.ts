import { join } from 'path'
import * as vscode from 'vscode'
import i18nFiles from './i18nFiles'

export enum SAVE_TYPE {
  $t,
  i18n
}

const transAndRefactor = async ({ filePath, text, type, range }) => {
  let key = await vscode.window.showInputBox({
    prompt: `请输入要保存的路径 (内容:${text})`,
    placeHolder: '示例:home.document.title'
  })

  if (!key) {
    return
  }

  const i18nFile = i18nFiles.getI18nFileByPath(filePath)
  let transData: any = i18nFile.getTransByKey(key)
  let firstTransData = transData[0]

  // 如果是目录，添加前缀
  if (firstTransData.isDirectory && key.split('.').length === 1) {
    key = `common.${key}`
    transData = i18nFile.getLngFilesByKey(key)
    firstTransData = transData[0]
  }

  // 已有翻译检测
  if (firstTransData.data) {
    const isReplace = '覆盖'
    await vscode.window.showInformationMessage(
      `已有对应翻译【${firstTransData.data}】, 覆盖吗？`,
      { modal: true },
      isReplace
    )

    if (!isReplace) {
      return
    }
  }

  // 替换内容
  vscode.window.activeTextEditor.edit(editBuilder => {
    const value =
      type === SAVE_TYPE.$t ? `{{ $t('${key}') }}` : `i18n.t('${key}')`
    editBuilder.replace(range, value)
  })

  // 写入翻译
  const transZhCN = transData.find(item => item.lng === 'zh-CN')
  transZhCN.data = text

  const transByApiData = await i18nFiles.getTransByApi(transData)
  i18nFile.writeTransByKey(key, transByApiData)

  // 提示翻译
  const result = transData
    .filter(item => item !== transZhCN)
    .map(item => item.data)
  vscode.window.showInformationMessage(`翻译结果: ${result.join('|')}`)
}

export default transAndRefactor
