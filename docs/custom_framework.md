## 🎎 Custom Framework Config

If you are using an i18n framework that does not have built-in support by this extension, or you are using a custom i18n implementation, you can always make this extension support for your framework.

Create file `.vscode/i18n-ally-custom-framework.yml` then copy and paste the configs below.

```yaml
# .vscode/i18n-ally-custom-framework.yml

# An array of strings which contain Language Ids defined by VS Code
# You can check avaliable language ids here: https://code.visualstudio.com/docs/languages/overview#_language-id
languageIds:
  - javascript
  - typescript
  - javascriptreact
  - typescriptreact

# An array of RegExs to find the key usage. **The key should be captured in the first match group**.
# You should unescape RegEx strings in order to fit in the YAML file
# To help with this, you can use https://www.freeformatter.com/json-escape.html
keyMatchReg:
  # The following example shows how to detect `t("your.i18n.keys")`
  # the `{key}` will be placed by a proper keypath matching regex,
  # you can ignore it and use your own matching rules as well
  - "[^\\w\\d]t\\(['\"`]({key})['\"`]"


# An array of strings containing refactor templates.
# The "$1" will be replaced by the keypath specified.
# Optionally, uncomment the following two lines to use

# refactorTemplates:
#  - i18n.get("$1")


# If set to true, only enables this custom framework (will disable all built-in frameworks)
monopoly: true
```

The extension will detect the changes and enable it automatically. Enjoy! 🎉

> 💡 If you believe your custom framework config can be helpful for others, you can open a [Framework Support Request](https://github.com/antfu/i18n-ally/issues/new?assignees=&labels=framework+request&template=framework-support-request.md&title=%5BFramework+Request%5D) **with your custom config**! This can help me better integrate the framework to have built-in support. Thanks!
