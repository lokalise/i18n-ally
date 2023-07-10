import ReactI18nextFramework from './react-i18next'
import { DirStructure, KeyStyle } from '~/core'

class ShopifyI18nextFramework extends ReactI18nextFramework {
  id = 'i18next-shopify'
  display = 'Shopify I18next'

  perferredKeystyle?: KeyStyle = 'nested'
  perferredDirStructure?: DirStructure = 'file'

  detection = {
    packageJSON: [
      '@shopify/i18next-shopify',
    ],
  }
}

export default ShopifyI18nextFramework
