export function normalizeLocale(locale: string, fallback = 'en', strict = false, log: Function = console.log): string {
  if (!locale)
    return fallback

  try {
    locale = locale.replace(/_/g, '-')
    if (locale.split('-')[0].length !== 2)
      return fallback
    // @ts-ignore
    const canonical = Intl.getCanonicalLocales(locale)[0]
    if (strict)
      return Intl.Collator.supportedLocalesOf(canonical, { localeMatcher: 'lookup' })[0]
    return canonical
  }
  catch (e) {
    log(`Invalid locale code "${locale}"\n${e.toString()}`)
    return fallback
  }
}

export function getFlagFilename(locale: string) {
  const parts = locale.toLocaleLowerCase().split('-', 2)
  const flag = parts[parts.length - 1]
  return `${flag}.svg`
}
