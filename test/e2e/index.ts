import path from 'path'
import { runTests } from 'vscode-test'

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../..')
    const extensionTestsPath = path.resolve(__dirname, '../e2e-out/examples/vue-i18n/index')
    const fixturePath = path.resolve(__dirname, '../../examples/by-frameworks/vue-i18n')

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      version: '1.52.0',
      launchArgs: [fixturePath, '--disable-extensions'],
    })

    process.exit(0)
  }
  catch (err) {
    console.error('Failed to run tests')
    console.error(err)
    process.exit(1)
  }
}

main()
