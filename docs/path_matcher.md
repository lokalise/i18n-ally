## Path matcher

### Custom filename match

> Supported from 1.14

Some i18n framework requires you to use some kinda name conversions. For example, in VSCode extension, the message files have to named like `package.nls.ja-jp.json`. In this case, you need to tell the extension how to find the file's locale code.

```jsonc
"i18n-ally.pathMatcher": "package.nls.{locale}.json"
```

> Note if you are using i18n-ally for VSCode i18n, you don't need to do this. It's already setup out of box.

### Custom namespace match

TODO:


### Advanced

TODO:
