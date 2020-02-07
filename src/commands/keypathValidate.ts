export function keypathValidate(keypath: string) {
  return !!keypath.match(/^[\w\d][\w\d\-\[\]\.\ ]*$/g)
}
