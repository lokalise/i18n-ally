import { resolve } from 'path'
import fs from 'fs-extra'
import fg from 'fast-glob'

async function run() {
  // move .d.ts files
  const files = await fg('**/*.d.ts', { cwd: 'dist/src' })
  await Promise.all(files.map(
    f => fs.move(resolve('dist/src', f), resolve('dist', f)),
  ))
  await fs.remove('dist/src')
}

run()
