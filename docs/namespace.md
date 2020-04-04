## Namespaces

Some i18n frameworks (e.g. [i18next](https://www.i18next.com/principles/namespaces), [Laravel](https://laravel.com/docs/5.6/localization)) supports namespaces. It's basically maps your locale file names to the root for your i18n keys.

For examples, with namespaces

```jsonc
// en/common.json

{
  "hello": "Hello",
  "foo": {
    "bar": "Foobar"
  }
}
```

```js
// app.js

i18n.t('common.hello') // Hello
i18n.t('common.foo.bar') // Foobar
```

The feature is disabled by default, it can be enabled by the framework you use (Laravel for example). If you want to use it, you can set it explicitly.

```jsonc
"i18n-ally.namespace": true
```

For more complex use cases, please refer to [Path Matcher](./path_matcher.md).
