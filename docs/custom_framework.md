## 🎎 Custom Framework Config

If your are using an i18n framework do not have built-in support by this extension or you are using a custom i18n implementation, you can always make this extension support for your framework.

By create file `.vscode/i18n-ally-custom-framework.yml` and copy paste the configs below.

```yaml
# .vscode/i18n-ally-custom-framework.yml

# An array of string which contains Language Ids defined by vscode
# You can check avaliable language ids here: https://code.visualstudio.com/docs/languages/overview#_language-id
languageIds:
  - javascript
  - typescript
  - javascriptreact
  - typescriptreact

# An Array of regex to find the keys usage. **The key should captured in the first match group**.
# You should unescape regex string in order to fit in YAML file
# for that, you can use https://www.freeformatter.com/json-escape.html
keyMatchReg:
  # The following examples show how to detect `t("your.i18n.keys")`
  - "[^\\w\\d]t\\(['\"`]([[\\w\\d\\. \\-\\[\\]]*?)['\"`]"

# If set to true, only enables custom framework (will disable all built-in frameworks)
monopoly: false
```

The extension will detect the changes and enable it automatically. Enjoy! 🎉

> 💡 If you believe your custom framework config can be works for others, you can open a [Framework Support Request](https://github.com/antfu/i18n-ally/issues/new?assignees=&labels=framework+request&template=framework-support-request.md&title=%5BFramework+Request%5D) **with your custom config**! This can help me better integerate the framework to have built-in support. Thanks!
