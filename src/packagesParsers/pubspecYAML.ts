import YAML from 'js-yaml'
import { PackageParser } from './base'

export class PubspecYAMLParser extends PackageParser {
  static filename = 'pubspec.yaml'

  protected static parserRaw(raw: string) {
    const {
      dependencies = {},
      dev_dependencies = {},
    } = YAML.safeLoad(raw)

    return [...Object.keys(dependencies), ...Object.keys(dev_dependencies)]
  }
}
