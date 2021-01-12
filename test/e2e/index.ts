import { resolve, join } from 'path'
import { runTests } from 'vscode-test'
import fg from 'fast-glob'
import chalk from 'chalk'

const args = process.argv.slice(2)

async function main() {
  const root = resolve(__dirname, '../..')
  const extensionDevelopmentPath = root

  // Frameworks
  const testFrameworksDir = join(root, 'test/e2e-out/frameworks')

  const frameworks = args.length
    ? args
    : await fg('*', { onlyDirectories: true, cwd: testFrameworksDir })

  try {
    for (const framework of frameworks) {
      console.log(`\n\n${chalk.blue('Start E2E testing for framework')} ${chalk.magenta(framework)} ${chalk.blue('...\n')}`)
      const extensionTestsPath = join(testFrameworksDir, framework, 'index')
      const fixturePath = join(root, 'examples/by-frameworks', framework)

      await runTests({
        extensionDevelopmentPath,
        extensionTestsPath,
        version: '1.52.0',
        launchArgs: [fixturePath, '--disable-extensions'],
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
