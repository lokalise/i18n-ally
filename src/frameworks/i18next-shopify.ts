import ReactI18nextFramework from './react-i18next'
import { DirStructure, KeyStyle } from '~/core'

class ShopifyI18nextFramework extends ReactI18nextFramework {
  id = 'i18next-shopify'
  display = 'Shopify I18next'

  preferredKeystyle?: KeyStyle = 'nested'
  preferredDirStructure?: DirStructure = 'file'

  detection = {
    packageJSON: [
      '@shopify/i18next-shopify',
    ],
  }

  derivedKeyRules = [
    '{key}.plural',
    '{key}.0',
    '{key}.1',
    '{key}.2',
    '{key}.3',
    '{key}.4',
    '{key}.5',
    '{key}.6',
    '{key}.7',
    '{key}.8',
    '{key}.9',
    // support v4 format as well as v3
    '{key}.zero',
    '{key}.one',
    '{key}.two',
    '{key}.few',
    '{key}.many',
    '{key}.other',
  ]
}

export default ShopifyI18nextFramework
