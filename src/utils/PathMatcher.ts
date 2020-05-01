// Examples
// {namespaces}/{lang}.json
// {lang}/{namespace}/**/*.json
// something/{lang}/{namespace}/**/*.*
export function ParsePathMatcher(pathMatcher: string, exts = '') {
  let regstr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', '(?<locale>[\\w-_]+)')
    .replace('{locale?}', '(?<locale>[\\w-_]*?)')
    .replace('{namespace}', '(?<namespace>[^/\\\\]+)')
    .replace('{namespace?}', '(?<namespace>[^/\\\\]*?)')
    .replace('{namespaces}', '(?<namespace>.+)')
    .replace('{namespaces?}', '(?<namespace>.*?)')
    .replace('{ext}', `(?<ext>${exts})`)

  regstr = `^${regstr}$`

  return new RegExp(regstr)
}

export function ReplaceLocale(filepath: string, pathMatcher: string, locale: string, exts = '') {
  let regstr = pathMatcher
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('*\\.', '.*\\.')
    .replace(/\/?\*\*\//g, '(?:.*/|^)')
    .replace('{locale}', ')[\\w-_]+(')
    .replace('{namespace}', '(?:[^/\\\\]+)')
    .replace('{namespace?}', '(?:[^/\\\\]*?)')
    .replace('{namespaces}', '(?:.+)')
    .replace('{namespaces?}', '(?:.*?)')
    .replace('{ext}', `(?<ext>${exts})`)

  regstr = `^(${regstr})$`

  return filepath.replace(new RegExp(regstr), `$1${locale}$2`)
}
