## Path Matcher

> Supported from 1.14

The path matcher provides a way to describe your directory structures, file naming and namespace mapping. It tells the extension how to handle your custom cases.

### Custom Filename Match

Some i18n frameworks require you to use some kind of name conversions. For example, in the VSCode extension, the message files have to be named like `package.nls.ja-jp.json`. In this case, you need to tell the extension how to find the file's locale code.

```jsonc
"i18n-ally.pathMatcher": "package.nls.{locale}.json"
```

> Note: if you are using i18n-ally for VSCode i18n, you don't need to do this. It's already setup out of the box.

### Custom [Namespaces](./namespace.md) Match

You can use path matcher to customize how namespaces are captured. You need to enable the namespace config first, for it to work.

```jsonc
"i18n-ally.namespace": true,
"i18n-ally.pathMatcher": "{locale}/{namespaces}.json"
```

Please check out the [examples](#example-1) below.

----------

### Options

The path matcher matches the relative path from your locale folder. File paths with no match will not be loaded.

Some common examples:

```bash
{locale}/{namespace}.{ext}   # matches "zh-CN/attributes.yaml"

{namespaces}/{locale}.{ext}  # matches "common/users/en-US.json"

{locale}.json                # matches "fr-FR.json"
```

The following table lists some keywords you may want to use. `{locale}` is required, while the others are optional.

| Keyword      | Description |
| -----------  | ----------- |
| {locale}     | Match the locale code, `en-US` `zh-CN` `fr` etc. |
| {locale?}    | Optional version of `{locale}`, if not locale captured, the current source language will be applied |
| {namespace}  | Match anything exclude folder separator `/`. It only matches one level of directories |
| {namespaces} | Match anything. It can match multiple levels of directories. The folder separator will be converted to `.` in keypath |
| {ext}        | File extensions, based on current enabled parsers |

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
'nl-NL/attributes/foo.yaml'

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
'{namespaces}/{locales}.yaml'

// Example Path
'attributes/bar/en.yaml'

// Matched result
{ locale: 'en', namespace: 'attributes.bar' }

// Example usage
$t('attributes.bar.your-key')
```
