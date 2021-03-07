export interface ExtractionHTMLOptions {
  /**
   * HTML attributes to extract
   *
   * @default ['title', 'alt', 'placeholder', 'label', 'aria-label']
   */
  attributes?: string[]

  /**
   * Extract Vue v-bind syntax
   *
   * @default true
   */
  vBind?: boolean

  /**
   * TODO: Extract inline text in HTML
   *
   * @default true
   */
  inlineText?: boolean
}
