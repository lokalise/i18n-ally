## Path matcher

> Supported from 1.14

Path matcher provides a way to describe your directory structures, file naming and namespace mapping. It tell the extension how to handle your custom cases.

### Custom filename match

Some i18n framework requires you to use some kinda name conversions. For example, in VSCode extension, the message files have to named like `package.nls.ja-jp.json`. In this case, you need to tell the extension how to find the file's locale code.

```jsonc
"i18n-ally.pathMatcher": "package.nls.{locale}.json"
```

> Note if you are using i18n-ally for VSCode i18n, you don't need to do this. It's already setup out of box.

### Custom namespaces match

> If you don't know what is `namespaces`, please refer to [this page](./namespace.md).

// TODO:


### Advanced

The path matcher matchs relative path from your locale folder. File paths with no match will not be loaded.

A common path matcher would be like:

```
{locale}/{namespace}.*
```

The following table listed some keywords you may want to use. `{locale}` is required while others are optional.

| Keyword      | Description |
| -----------  | ----------- |
| {locale}     | Match the locale code, `en-US` `zh-CN` `fr` etc |
| {namespace}  | Match anything exclude folder seperator `/`. It only matchs up to one level of directories |
| {namespaces} | Match anything. It can match multiple levels of directories. The folder seperator will be converted to `.` in keypath |


### Example 1

Directory structure:

```
i18n
  ├── nl-NL
  |   ├── general
  |   |   └── ...
  |   ├── attributes
  |   |   └── foo.yaml
  |   └── ...
  ├── en
  |   ├── general
  |   |   └── ...
  |   ├── attributes
  |   |   └── foo.yaml
  |   └── ...
```

```js
// Path Matcher
'{locale}/{namespaces}.yaml'

// Example Path
'nl-NL/attributes/foo.yml'

// Matched result
{ locale: 'nl-NL', namespace: 'attributes.foo' }

// Example usage
$t('attributes.foo.your-key')
```

### Example 2

Directory structure:

```
i18n
  ├── general
  |   ├── nl.yaml
  |   ├── de.yaml
  |   ├── en.yaml
  |   └── ...
  ├── attributes
  |   ├── foo
  |   |   ├── nl.yaml
  |   |   ├── de.yaml
  |   |   ├── en.yaml
  |   |   └── ...
  |   ├── bar
  |   |    └── ...
  |   └── ...
  ├──  resources
  |    └── ...
  └── ...
```

```js
// Path Matcher
'{namespaces}/{locales}.json'

// Example Path
'attributes/bar/en.json'

// Matched result
{ locale: 'en', namespace: 'attributes.bar' }

// Example usage
$t('attributes.bar.your-key')
```
