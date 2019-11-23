import { window } from 'vscode'
import { ExtensionModule } from '../modules'
import { ViewIds } from './ViewIds'
import { FileLocalesTreeProvider, HelpFeedbackProvider, ProgressProvider, LocalesTreeProvider } from './providers'

export * from './items'
export * from './providers'

const m: ExtensionModule = (ctx) => {
  const currentFileTreeProvider = new FileLocalesTreeProvider(ctx)

  // Explorer tab
  window.createTreeView(ViewIds.file_in_explorer, {
    treeDataProvider: currentFileTreeProvider,
    showCollapseAll: true,
  })

  // Extension tab
  window.createTreeView(ViewIds.file, {
    treeDataProvider: currentFileTreeProvider,
    showCollapseAll: true,
  })

  window.createTreeView(ViewIds.progress, {
    treeDataProvider: new ProgressProvider(ctx),
    showCollapseAll: true,
  })

  window.createTreeView(ViewIds.tree, {
    treeDataProvider: new LocalesTreeProvider(ctx),
    showCollapseAll: true,
  })

  window.createTreeView(ViewIds.feedback, {
    treeDataProvider: new HelpFeedbackProvider(ctx),
  })

  return []
}

export default m
