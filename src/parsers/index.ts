import { Json5Parser } from './json5'
import { JsonParser } from './json'
import { YamlParser } from './yaml'
import { EcmascriptParser } from './ecmascript'
import { IniParser } from './ini'
import { PoParser } from './po'
import { PhpParser } from './php'
import { Properties } from './properties'
import { Parser } from './base'

export const DefaultEnabledParsers = ['json', 'yaml', 'json5']

export const AvailableParsers: Parser[] = [
  // enabled parsers
  new JsonParser(),
  new YamlParser(),
  new Json5Parser(),

  // avaliable parsers
  new EcmascriptParser('js'),
  new EcmascriptParser('ts'),
  new IniParser(),
  new PoParser(),
  new PhpParser(),
  new Properties(),
]
