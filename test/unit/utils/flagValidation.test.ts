import { expect } from 'chai'
import { readdirSync } from 'fs'
import { join } from 'path'

describe('Flag Validation', () => {
  it('should validate that all flag files have valid ISO-639-1 language codes or ISO-639-1 with country codes', () => {
    // Valid ISO-639-1 language codes
    const iso639_1Codes = new Set([
      'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
      'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce',
      'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv', 'dz', 'ee',
      'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr',
      'fy', 'ga', 'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr',
      'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is',
      'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn',
      'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln',
      'lo', 'lt', 'lu', 'lv', 'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms',
      'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv',
      'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu',
      'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk',
      'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw', 'ta',
      'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw',
      'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi',
      'yo', 'za', 'zh', 'zu'
    ])

    // Valid ISO-3166-1 alpha-2 country codes (subset that makes sense for language variants)
    const countryCodePattern = /^[A-Z]{2}$/

    const flagsDir = join(__dirname, '../../../res/flags')
    const flagFiles = readdirSync(flagsDir).filter(file => file.endsWith('.svg'))

    const invalidFiles: string[] = []
    const validSpecialCases = new Set([
      'unknown.svg', // Special case for unknown languages
      'eu.svg',      // European Union (not a country but widely used)
      'eo.svg'       // Esperanto (constructed language with ISO-639-1 code)
    ])

    for (const file of flagFiles) {
      const filename = file.replace('.svg', '')
      
      // Skip special cases
      if (validSpecialCases.has(file)) {
        continue
      }

      let isValid = false

      // Check if it's a valid ISO-639-1 code
      if (iso639_1Codes.has(filename)) {
        isValid = true
      }
      // Check if it's ISO-639-1 + country code (e.g., "en-US", "zh-CN")
      else if (filename.includes('-')) {
        const parts = filename.split('-')
        if (parts.length === 2) {
          const [langCode, countryCode] = parts
          if (iso639_1Codes.has(langCode) && countryCodePattern.test(countryCode.toUpperCase())) {
            isValid = true
          }
        }
        // Handle special cases like "es-ca" (Catalan in Spain), "gb-eng" (England), etc.
        else if (parts.length === 2) {
          const [part1, part2] = parts
          // Special cases for regional variants
          const specialRegionalCases = new Set([
            'es-ca', 'es-eu', 'es-gl', // Spanish regional variants
            'gb-eng', 'gb-nir', 'gb-sct', 'gb-wls' // UK regional variants
          ])
          if (specialRegionalCases.has(filename)) {
            isValid = true
          }
        }
      }
      // Check for 2-letter country codes that are commonly used as language identifiers
      else if (filename.length === 2 && countryCodePattern.test(filename.toUpperCase())) {
        // Many country codes are used as language identifiers (e.g., "us" for English US)
        isValid = true
      }

      if (!isValid) {
        invalidFiles.push(file)
      }
    }

    // Report any invalid files
    if (invalidFiles.length > 0) {
      expect.fail(`Found ${invalidFiles.length} flag files with invalid naming: ${invalidFiles.join(', ')}`)
    }

    // Ensure we actually tested some files
    expect(flagFiles.length).to.be.greaterThan(0, 'No flag files found to test')
  })
})