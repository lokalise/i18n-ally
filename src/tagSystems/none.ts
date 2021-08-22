import { BCP47 } from './bcp47'

// extending BCP47 to try to get flag from BCP47 format if possible
// but do nothing on normalization
export class NoneTagSystem extends BCP47 {
  // no convertsion
  normalize(locale?: string, fallback = 'en') {
    return locale || fallback
  }
}
