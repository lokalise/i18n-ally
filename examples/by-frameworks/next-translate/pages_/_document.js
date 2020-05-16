import Document, { Html, Head, Main, NextScript } from 'next/document'
import i18nConfig from '../i18n.json'

function documentLang({ __NEXT_DATA__ }) {
  const { page } = __NEXT_DATA__
  const [, langQuery] = page.split('/')
  const lang = i18nConfig.allLanguages.find((l) => l === langQuery)

  return lang || i18nConfig.defaultLanguage
}

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang={documentLang(this.props)}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
