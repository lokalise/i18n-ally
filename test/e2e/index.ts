/* eslint-disable no-console */
import { resolve, join } from 'path'
import { runTests } from '@vscode/test-electron'
import fg from 'fast-glob'
import fs from 'fs-extra'
import chalk from 'chalk'

const args = process.argv.slice(2)

async function main() {
  const root = resolve(__dirname, '../..')
  const extensionDevelopmentPath = root

  // Frameworks
  const testFrameworksDir = join(root, 'test/e2e-out/frameworks')
  const fixtureTempPath = join(root, 'test/e2e-fixtures-temp')

  if (fs.existsSync(fixtureTempPath))
    await fs.remove(fixtureTempPath)

  const frameworks = args.length
    ? args
    : await fg('*', { onlyDirectories: true, cwd: testFrameworksDir })

  try {
    for (const framework of frameworks) {
      console.log(`\n\n${chalk.blue('Start E2E testing for framework')} ${chalk.magenta(framework)} ${chalk.blue('...\n')}`)
      const extensionTestsPath = join(testFrameworksDir, framework, 'index')
      const fixtureSourcePath = join(root, 'examples/by-frameworks', framework)
      const fixtureTargetPath = join(fixtureTempPath, framework)

      await fs.copy(fixtureSourcePath, fixtureTargetPath)

      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        version: '1.77.3',
        launchArgs: [fixtureTargetPath, '--disable-extensions'],
      })

      console.log(chalk.green(`E2E tests for framework ${framework} finished.\n`))
    }

    process.exit(0)
  }
  catch (err) {
    console.error('Failed to run tests')
    console.error(err)
    process.exit(1)
  }
}

main()
