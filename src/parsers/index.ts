import { Json5Parser } from './Json5Parser'
import { JsonParser } from './JsonParser'
import { YamlParser } from './YamlParser'
import { JavascriptParser } from './JavascriptParser'
import { Parser } from './Parser'

export const PARSERS: Parser[] = [
  new JsonParser(),
  new YamlParser(),
  new JavascriptParser(),
  new Json5Parser(),
]
