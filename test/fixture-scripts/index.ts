import { dirname, join, basename, resolve } from 'path'
import { runTests } from 'vscode-test'
import fg from 'fast-glob'
import fs from 'fs-extra'
import chalk from 'chalk'

function deepDirname(dir: string, depth = 1) {
  for (let i = 0; i < depth; i++)
    dir = dirname(dir)
  return dir
}

export interface FixtureInfo {
  dirInput: string
  dirOutput: string
  dirConfig: string
  name: string
  category: string
  type: string
  framework: string
}

export async function listAll(): Promise<FixtureInfo[]> {
  const root = 'test/fixtures/'
  const inputs = await fg(`${root}**/input`, {
    onlyDirectories: true,
  })

  return inputs.map(input => ({
    dirInput: input,
    dirOutput: join(dirname(input), 'output'),
    dirConfig: join(root, basename(deepDirname(input, 5)), '.vscode'),
    name: basename(dirname(input)),
    category: basename(deepDirname(input, 2)),
    type: basename(deepDirname(input, 4)),
    framework: basename(deepDirname(input, 5)),
  }))
}

export async function prepareFixture(info: FixtureInfo) {
  const root = 'test/fixtures-temp'
  await fs.ensureDir(root)
  const id = [info.framework, info.type, info.name].join('-')
  const path = join(root, id)
  if (fs.existsSync(path))
    await fs.remove(path)

  await fs.copy(info.dirInput, path, { recursive: true })
  await fs.copy(info.dirConfig, join(path, basename(info.dirConfig)), { recursive: true })

  return path
}

async function run() {
  const fixtures = await listAll()
  // console.log(fixtures)

  // TODO: enable all cases
  const fixtrue = fixtures.find(f => f.name === 'simple_variable' && f.category === 'concatenation')
  if (fixtrue)
    await testFixture(fixtrue)
}

async function testFixture(fixture: FixtureInfo) {
  try {
    const root = resolve(__dirname, '../..')
    const path = await prepareFixture(fixture)

    await runTests({
      extensionDevelopmentPath: root,
      extensionTestsPath: join(__dirname, 'runner.js'),
      version: '1.52.0',
      launchArgs: [path, '--disable-extensions'],
    })
  }
  catch (e) {
    console.log(chalk.red(`❌ ${fixture.category} > ${fixture.name}`))
    return
  }
  console.log(chalk.green(`✅ ${fixture.category} > ${fixture.name}`))
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
