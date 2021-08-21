import { workspace, Uri, WorkspaceEdit, Range } from 'vscode'
import { parse as vueParse } from '@vue/component-compiler-utils'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'
import { SFCDescriptor, SFCBlock } from '@vue/component-compiler-utils/dist/parse'
import * as compiler from 'vue-template-compiler'
import { PendingWrite, NodeOptions } from '../types'
import { FluentParser } from '../../parsers/ftl'
import { LocaleTree } from '../Nodes'
import { Config } from '../Config'
import { Loader } from './Loader'
import { File, Log } from '~/utils'

interface SFCFileInfo {
  path: string
  content: string
}

type SFCFluentBlock = {
  locale: string
  messages: Record<string, string>
}

const parser = new FluentParser()

async function getFluentBlocks(file: SFCFileInfo): Promise<SFCFluentBlock[]> {
  const descriptor = vueParse({
    source: file.content,
    filename: file.path,
    compiler: compiler as VueTemplateCompiler,
  })

  const promises = descriptor.customBlocks.map(async(block) => {
    if (block.type === 'fluent') {
      return {
        locale: block.attrs.locale,
        messages: await parser.parse(block.content),
      } as SFCFluentBlock
    }

    return null
  }).filter(Boolean) as Promise<SFCFluentBlock>[]

  return await Promise.all(promises)
}

export class FluentVueSfcLoader extends Loader {
  constructor(
    public readonly uri: Uri,
  ) {
    super(`[FluentVue SFC]${uri.fsPath}`)

    this.load()
  }

  get filepath() {
    return this.uri.fsPath
  }

  get files() {
    return []
  }

  async load() {
    const filepath = this.filepath
    Log.info(`📑 Loading fluent-vue sfc ${filepath}`)
    const doc = await workspace.openTextDocument(this.uri)
    const meta = await getFluentBlocks({ path: this.filepath, content: doc.getText() })

    this.updateLocalesTree(meta)
    this._onDidChange.fire(this.name)
  }

  private getOptions(locale: string): NodeOptions {
    return {
      filepath: this.uri.fsPath,
      locale: Config.normalizeLocale(locale),
      features: {
        FluentVueSfc: true,
      },
    }
  }

  _locales = new Set<string>()

  private updateLocalesTree(blocks: SFCFluentBlock[]) {
    this._flattenLocaleTree = {}
    this._locales = new Set()

    const tree = new LocaleTree({ keypath: '', features: { FluentVueSfc: true } })
    for (const section of blocks) {
      if (!section.messages)
        continue

      this._locales.add(Config.normalizeLocale(section.locale))
      this.updateTree(tree, section.messages, '', '', this.getOptions(section.locale))
    }

    this._localeTree = tree
  }

  get locales() {
    return Array.from(this._locales)
  }

  async write(pendings: PendingWrite | PendingWrite[]) {
    if (!Array.isArray(pendings))
      pendings = [pendings]

    pendings = pendings.filter(i => i)

    for (const pending of pendings) {
      const path = pending.textFromPath
      if (!path)
        continue

      const doc = await workspace.openTextDocument(this.uri)
      const source = doc.getText()

      const parseResult = vueParse({
        source,
        filename: pending.filepath ?? pending.textFromPath,
        compiler: compiler as VueTemplateCompiler,
      })

      let fluentBlock = parseResult.customBlocks
        .find(block => block.type === 'fluent' && block.attrs.locale === pending.locale)

      const newTranslation = { [pending.keypath]: pending.value! }

      if (fluentBlock) {
        const newBlockContent = parser.merge(fluentBlock.content, newTranslation)
        fluentBlock.content = newBlockContent
      }
      else {
        fluentBlock = {
          type: 'fluent',
          attrs: {
            locale: pending.locale,
          },
          content: parser.merge('', newTranslation),
          start: 0,
          end: 0,
        }
      }

      // Write back
      const blocks = getBlocks(parseResult)
      const newContent = buildContent(fluentBlock, source, blocks)

      if (doc.isDirty) {
        const edit = new WorkspaceEdit()
        edit.replace(this.uri, new Range(doc.positionAt(0), doc.positionAt(Infinity)), newContent)

        await workspace.applyEdit(edit)
      }
      else {
        await File.write(this.filepath, newContent)
      }

      await this.load()
    }
  }

  canHandleWrites(pending: PendingWrite) {
    return pending.filepath === this.filepath || pending.textFromPath === this.filepath
  }
}

function getBlocks(descriptor: SFCDescriptor): SFCBlock[] {
  const { template, script, styles, customBlocks } = descriptor
  const blocks: SFCBlock[] = [...styles, ...customBlocks]
  template && blocks.push(template as SFCBlock)
  script && blocks.push(script as SFCBlock)
  blocks.sort((a, b) => {
    return a.start! - b.start!
  })
  return blocks
}

function buildContent(blockToAdd: SFCBlock, raw: string, blocks: SFCBlock[]): string {
  let offset = 0
  let inserted = false
  let contents: string[] = []
  let fluentOffset = -1

  contents = blocks.reduce((contents, block) => {
    if (block.type === 'fluent' && block.attrs.locale === blockToAdd.attrs.locale) {
      contents = contents.concat(raw.slice(offset, block.start))
      contents = contents.concat(`\n${blockToAdd.content}`)
      offset = block.end as number
      inserted = true
    }
    else {
      contents = contents.concat(raw.slice(offset, block.end))
      offset = block.end as number

      if (block.type === 'fluent')
        fluentOffset = contents.length
    }
    return contents
  }, contents)

  contents = contents.concat(raw.slice(offset, raw.length))

  if (!inserted) {
    const content = `\n<fluent locale="${blockToAdd.attrs.locale}">\n${blockToAdd.content}</fluent>\n`

    if (fluentOffset !== -1)
      contents.splice(fluentOffset, 0, content)
    else
      contents.push(content)
  }

  return contents.join('')
}
