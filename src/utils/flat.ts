
import { set, get, isObject } from 'lodash'

export const ROOT_KEY = '__i18n_ally_root__'

export function flatten(data: any) {
  const output: any = {}

  function step(obj: any, prev?: string) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      const isarray = Array.isArray(value)
      const type = Object.prototype.toString.call(value)
      const isobject
        = type === '[object Object]'
        || type === '[object Array]'

      const newKey = key === ROOT_KEY
        ? prev || ''
        : prev
          ? `${prev}.${key}`
          : key

      if (!isarray && isobject && Object.keys(value).length)
        return step(value, newKey)

      output[newKey] = value
    })
  }

  step(data)

  return output
}

export function unflatten(data: any) {
  const output: any = {}

  Object.keys(data || {})
    .sort((a, b) => b.length - a.length)
    .forEach((key) => {
      const original = key
        ? get(output, key)
        : output

      if (isObject(original))
        set(output, key ? `${key}.${ROOT_KEY}` : ROOT_KEY, data[key])
      else if (original === undefined)
        set(output, key, data[key])
      else
        throw new Error(`Duplicated key ${key} found`)
    })

  return output
}
