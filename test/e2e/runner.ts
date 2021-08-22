import path from 'path'
import Mocha from 'mocha'
import fg from 'fast-glob'
import { window } from 'vscode'

export function createRunner(dir: string) {
  return () => {
    const mocha = new Mocha({
      ui: 'bdd',
      reporter: 'list',
      color: true,
      timeout: 20_000,
    })
    const root = path.resolve(dir)
    const files = fg.sync('*.test.js', { cwd: root })
    files.forEach(f => mocha.addFile(path.resolve(root, f)))

    window.showInformationMessage('Tests started.')

    try {
      mocha.run((failures) => {
        if (failures > 0)
          window.showErrorMessage(`${failures} tests failed.`)
        window.showInformationMessage('Tests Finished.')
        setTimeout(() => process.exit(failures || 0), 2000)
      })
    }
    catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setTimeout(() => process.exit(1), 2000)
    }
  }
}
