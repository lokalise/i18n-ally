import { Json5Parser } from './json5'
import { JsonParser } from './json'
import { YamlParser } from './yaml'
import { EcmascriptParser } from './es'
import { IniParser } from './ini'
import { PoParser } from './po'
import { PhpParser } from './php'
import { Parser } from './base'

export const DefaultEnabledParsers = ['json', 'yaml', 'json5']

export const AvaliablePasers: Parser[] = [
  new JsonParser(),
  new YamlParser(),
  new Json5Parser(),

  new EcmascriptParser('js'),
  new EcmascriptParser('ts'),
  new IniParser(),
  new PoParser(),
  new PhpParser(),
]
