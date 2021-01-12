import fs from 'fs-extra'

async function run() {
  await fs.writeFile('dist/extension.d.ts', 'export * from \'./src/extension\'')
}

run()
