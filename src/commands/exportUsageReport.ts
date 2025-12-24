import { commands, window, workspace, Uri } from 'vscode'
import { Commands } from './commands'
import { ExtensionModule } from '~/modules'
import { Analyst, UsageReport } from '~/core'
import i18n from '~/i18n'

function generateMarkdown(report: UsageReport): string {
  const lines: string[] = []
  const now = new Date().toISOString().split('T')[0]

  lines.push(`# i18n Usage Report`)
  lines.push(``)
  lines.push(`> Generated on ${now}`)
  lines.push(``)

  // Summary
  lines.push(`## Summary`)
  lines.push(``)
  lines.push(`| Status | Count |`)
  lines.push(`|--------|-------|`)
  lines.push(`| ✅ Active (In Use) | ${report.active.length} |`)
  lines.push(`| ⚠️ Idle (Not Used) | ${report.idle.length} |`)
  lines.push(`| ❌ Missing | ${report.missing.length} |`)
  lines.push(`| **Total** | **${report.active.length + report.idle.length + report.missing.length}** |`)
  lines.push(``)

  // Active Keys
  if (report.active.length > 0) {
    lines.push(`## ✅ Active Keys (${report.active.length})`)
    lines.push(``)
    lines.push(`Keys that are defined and used in code.`)
    lines.push(``)
    lines.push(`| Key | Usages |`)
    lines.push(`|-----|--------|`)
    for (const usage of report.active) {
      lines.push(`| \`${usage.keypath}\` | ${usage.occurrences.length} |`)
    }
    lines.push(``)
  }

  // Idle Keys
  if (report.idle.length > 0) {
    lines.push(`## ⚠️ Idle Keys (${report.idle.length})`)
    lines.push(``)
    lines.push(`Keys that are defined but NOT used in code. Consider removing these.`)
    lines.push(``)
    lines.push(`<details>`)
    lines.push(`<summary>Click to expand</summary>`)
    lines.push(``)
    for (const usage of report.idle) {
      lines.push(`- \`${usage.keypath}\``)
    }
    lines.push(``)
    lines.push(`</details>`)
    lines.push(``)
  }

  // Missing Keys
  if (report.missing.length > 0) {
    lines.push(`## ❌ Missing Keys (${report.missing.length})`)
    lines.push(``)
    lines.push(`Keys that are used in code but NOT defined in locale files.`)
    lines.push(``)
    lines.push(`| Key | Occurrences |`)
    lines.push(`|-----|-------------|`)
    for (const usage of report.missing) {
      const files = [...new Set(usage.occurrences.map(o => o.filepath.split('/').pop()))].join(', ')
      lines.push(`| \`${usage.keypath}\` | ${files} |`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.export_usage_report,
      async() => {
        // Analyze and get current usage report
        const report = await Analyst.analyzeUsage(true)

        if (!report || (report.active.length === 0 && report.idle.length === 0 && report.missing.length === 0)) {
          window.showWarningMessage(i18n.t('command.export_no_report'))
          return
        }

        // Generate markdown content
        const markdown = generateMarkdown(report)

        // Ask user where to save
        const uri = await window.showSaveDialog({
          defaultUri: Uri.file('i18n-usage-report.md'),
          filters: {
            Markdown: ['md'],
            'All Files': ['*'],
          },
          title: 'Export Usage Report',
        })

        if (!uri)
          return // User cancelled

        // Write to file
        await workspace.fs.writeFile(uri, Buffer.from(markdown, 'utf-8'))

        const action = await window.showInformationMessage(
          i18n.t('command.export_success', uri.fsPath),
          'Open File',
        )
        if (action === 'Open File')
          commands.executeCommand('vscode.open', uri)
      },
    ),
  ]
}
