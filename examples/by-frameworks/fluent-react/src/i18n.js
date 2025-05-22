import { ReactLocalization } from '@fluent/react'
import { negotiateLanguages } from '@fluent/langneg'
import { FluentBundle } from '@fluent/bundle'

const locales = ['en', 'ja']
const defaultLocale = 'ja'

export async function* generateBundles(userLocales) {
  const currentLocales = negotiateLanguages(
    userLocales,
    locales,
    { defaultLocale }
  )

  for (const locale of currentLocales) {
    const response = await fetch(`/locales/${locale}.ftl`)
    const text = await response.text()
    const bundle = new FluentBundle(locale)
    bundle.addResource(new FluentResource(text))
    yield bundle
  }
}

export function createLocalization(userLocales) {
  return new ReactLocalization(generateBundles(userLocales))
} 