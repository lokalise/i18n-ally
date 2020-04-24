/* eslint-disable @typescript-eslint/no-use-before-define */

export function cleanArray(obj: any[]) {
  obj = obj
    .map((i: any) => cleanObject(i))
    .filter((i: any) => i != null)

  if (!obj.length)
    return undefined

  return obj
}

/**
 * Remove undefined, empty objects, empty arrays from an object.
 *
 */
export function cleanObject(obj: any) {
  if (obj == null)
    return undefined

  if (Array.isArray(obj))
    return cleanArray(obj)

  if (typeof obj !== 'object')
    return obj

  for (const key of Object.keys(obj)) {
    if (obj[key] == null) {
      delete obj[key]
    }
    else if (typeof obj[key] === 'object') {
      obj[key] = cleanObject(obj[key])
      if (obj[key] == null)
        delete obj[key]
    }
    else if (Array.isArray(obj[key])) {
      obj[key] = cleanArray(obj[key])

      if (obj[key] == null)
        delete obj[key]
    }
  }

  if (!Object.keys(obj).length)
    return undefined

  return obj
}
