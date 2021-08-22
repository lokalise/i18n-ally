import {
  camelCase,
  constantCase,
  paramCase,
  pascalCase,
  snakeCase,
} from 'change-case'

export type CaseStyles =
 | 'default'
 | 'kebab-case'
 | 'snake_case'
 | 'camelCase'
 | 'PascalCase'
 | 'ALL_CAPS'

export function changeCase(str: string, style: CaseStyles) {
  if (!style || style === 'default')
    return str

  switch (style) {
    case 'ALL_CAPS':
      return constantCase(str)
    case 'kebab-case':
      return paramCase(str)
    case 'camelCase':
      return camelCase(str)
    case 'PascalCase':
      return pascalCase(str)
    case 'snake_case':
      return snakeCase(str)
    default:
      return str
  }
}
