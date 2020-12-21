import path from 'path'
import fg from 'fast-glob'
import fs from 'fs-extra'

const DEFAULT_LOCALE = 'en'

;(async() => {
  const fallbackMessages = JSON.parse(await fs.readFile(`./locales/${DEFAULT_LOCALE}.json`, 'utf-8'))

  const files = await fg('./locales/*.json')
  for (const file of files) {
    const { name: locale } = path.parse(file)
    const messages = JSON.parse(await fs.readFile(file, 'utf-8'))

    Object.keys(fallbackMessages)
      .forEach((key) => {
        messages[key] = messages[key] || fallbackMessages[key]
      })

    const output = locale === DEFAULT_LOCALE
      ? './package.nls.json'
      : `./package.nls.${locale.toLowerCase()}.json`

    await fs.writeFile(output, JSON.stringify(messages, null, 2), 'utf-8')
  }
})()
