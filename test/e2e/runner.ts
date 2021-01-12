import path from 'path'
import Mocha from 'mocha'
import fg from 'fast-glob'

export function createRunner(dir: string) {
  return () => {
    const mocha = new Mocha({
      ui: 'tdd',
      reporter: 'list',
      color: true,
      timeout: 20_000,
    })
    const root = path.resolve(dir)
    const files = fg.sync('*.test.js', { cwd: root })
    files.forEach(f => mocha.addFile(path.resolve(root, f)))

    try {
      mocha.run(failures =>
        setTimeout(() => process.exit(failures > 0 ? 1 : 0), 2000),
      )
    }
    catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
