
// Examples
// {namespaces}/{lang}.json
// {lang}/{namespace}/**/*.json
// something/{lang}/{namespace}/**/*.*
export function ParsePathMatcher(mapping: string) {
  let regstr = mapping
    .replace(/\./g, '\\.')
    .replace('.*', '..*')
    .replace('**/', '.*/')
    .replace('{locale}', '(?<locale>[\\w-]+)')
    .replace('{namespace}', '(?<namespace>[^/\\\\]+)')
    .replace('{namespaces}', '(?<namespace>.+)')
    .replace(/{(.+)}/, '(?:$1)')

  regstr = `^${regstr}$`

  return new RegExp(regstr, 'u')
}
