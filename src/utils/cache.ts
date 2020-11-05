/**
 * All cached data will lost on vscode reload.
 */
const cache: any = {}

function hasCache(key: string): boolean {
  return Object.hasOwnProperty.call(cache, key)
}

function setCache<T>(key: string, value: T): T {
  cache[key] = value
  return value
}

function getCache<T = any>(key: string, value?: T): T {
  if (cache[key] === undefined)
    cache[key] = value

  return cache[key]
}

export { hasCache, getCache, setCache }
