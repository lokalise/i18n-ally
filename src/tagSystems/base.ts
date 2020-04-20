
export abstract class BaseTagSystem {
  normalize(locale?: string, fallback = 'en', strict = false): string { return locale || fallback }
  toBCP47(str: string): string { return str }
  fromBCP47(bcp47: string): string { return bcp47 }
  getFlagName(locale: string): string | undefined { return undefined }
}
