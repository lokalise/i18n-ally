export function keypathValidate(keypath: string) {
  return !!keypath.match(/^[\w\d\-_][\w\d\-_[\]. ]*$/)
}
