/**
 * All cached data will lost on vscode reload.
 */
const cache: any = {}

function hasCache(key: string): boolean {
  return Object.hasOwnProperty.call(cache, key)
}

function setCache(key: string, value: any): any {
  cache[key] = value
  return value
}

function getCache(key: string): any {
  return cache[key]
}

export { hasCache, getCache, setCache }
