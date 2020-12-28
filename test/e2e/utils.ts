export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
