<img src="https://raw.githubusercontent.com/antfu/vue-i18n-ally/master/static/logo.png" alt="logo" width="150" align="right"/>

# Vue i18n Ally

🌍 Better [Vue i18n](https://github.com/kazupon/vue-i18n) experiences with VSCode

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/antfu.vue-i18n-ally.svg?color=blue&style=flat-square&label=VSCode%20Marketplace&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PGRlZnM+PHN0eWxlPi5he2ZpbGw6I2ZmZjt9LmEsLmd7ZmlsbC1ydWxlOmV2ZW5vZGQ7fS5ie21hc2s6dXJsKCNhKTt9LmN7ZmlsbDojMDA2NWE5O30uZHtmaWxsOiMwMDdhY2M7fS5le2ZpbGw6IzFmOWNmMDt9LmZ7b3BhY2l0eTowLjI1O30uZ3tmaWxsOnVybCgjYik7fTwvc3R5bGU+PG1hc2sgaWQ9ImEiIHg9Ii0wLjE2IiB5PSIwLjY2IiB3aWR0aD0iMjU2LjE2IiBoZWlnaHQ9IjI1NC42OCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggY2xhc3M9ImEiIGQ9Ik0xODEuNTMsMjU0LjI1YTE1LjkzLDE1LjkzLDAsMCwwLDEyLjctLjQ5bDUyLjcxLTI1LjM2QTE2LDE2LDAsMCwwLDI1NiwyMTRWNDJhMTYsMTYsMCwwLDAtOS4wNi0xNC40MkwxOTQuMjMsMi4yNEExNS45NCwxNS45NCwwLDAsMCwxNzgsMy43YTE2LjMsMTYuMywwLDAsMC0xLjkxLDEuNjNMNzUuMTUsOTcuMzksMzEuMiw2NGExMC42NSwxMC42NSwwLDAsMC0xMy42MS42MUwzLjQ5LDc3LjQ1YTEwLjY4LDEwLjY4LDAsMCwwLDAsMTUuNzhMNDEuNTksMTI4LDMuNDgsMTYyLjc3YTEwLjY4LDEwLjY4LDAsMCwwLDAsMTUuNzhsMTQuMSwxMi44MkExMC42NSwxMC42NSwwLDAsMCwzMS4yLDE5Mmw0NC0zMy4zNywxMDAuOSw5Mi4wNkExNiwxNiwwLDAsMCwxODEuNTMsMjU0LjI1Wk0xOTIsNjkuODksMTE1LjQ4LDEyOCwxOTIsMTg2LjEyWiIvPjwvbWFzaz48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIxMjcuODQiIHkxPSIyNTUuNDIiIHgyPSIxMjcuODQiIHkyPSIwLjc0IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEsIDAsIDAsIC0xLCAwLCAyNTYuMDgpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+QXJ0Ym9hcmQgMTwvdGl0bGU+PGcgY2xhc3M9ImIiPjxwYXRoIGNsYXNzPSJjIiBkPSJNMjQ2Ljk0LDI3LjY0LDE5NC4xOSwyLjI0QTE1Ljk0LDE1Ljk0LDAsMCwwLDE3Niw1LjMzTDMuMzIsMTYyLjc3YTEwLjY3LDEwLjY3LDAsMCwwLDAsMTUuNzhsMTQuMSwxMi44MmExMC42NywxMC42NywwLDAsMCwxMy42Mi42MUwyMzksMzQuMjNhMTAuNTksMTAuNTksMCwwLDEsMTcsOC40NHYtLjYyQTE2LDE2LDAsMCwwLDI0Ni45NCwyNy42NFoiLz48cGF0aCBjbGFzcz0iZCIgZD0iTTI0Ni45NCwyMjguMzZsLTUyLjc1LDI1LjRBMTUuOTQsMTUuOTQsMCwwLDEsMTc2LDI1MC42N0wzLjMyLDkzLjIzYTEwLjY3LDEwLjY3LDAsMCwxLDAtMTUuNzhsMTQuMS0xMi44MkExMC42NywxMC42NywwLDAsMSwzMS4wNiw2NEwyMzksMjIxLjc3YTEwLjU5LDEwLjU5LDAsMCwwLDE3LTguNDRWMjE0QTE2LDE2LDAsMCwxLDI0Ni45NCwyMjguMzZaIi8+PHBhdGggY2xhc3M9ImUiIGQ9Ik0xOTQuMiwyNTMuNzZhMTYsMTYsMCwwLDEtMTguMi0zLjA5QTkuMzcsOS4zNywwLDAsMCwxOTIsMjQ0VjEyYTkuMzcsOS4zNywwLDAsMC0xNi02LjYzLDE2LDE2LDAsMCwxLDE4LjItMy4wOUwyNDYuOTMsMjcuNkExNiwxNiwwLDAsMSwyNTYsNDJWMjE0YTE2LDE2LDAsMCwxLTkuMDcsMTQuNDJaIi8+PGcgY2xhc3M9ImYiPjxwYXRoIGNsYXNzPSJnIiBkPSJNMTgxLjM4LDI1NC4yNWExNS45MywxNS45MywwLDAsMCwxMi43LS40OWw1Mi43LTI1LjM2QTE2LDE2LDAsMCwwLDI1NS44NCwyMTRWNDJhMTYsMTYsMCwwLDAtOS4wNi0xNC40MkwxOTQuMDgsMi4yNEExNiwxNiwwLDAsMCwxNzcuOCwzLjdhMTYuMywxNi4zLDAsMCwwLTEuOTEsMS42M0w3NSw5Ny4zOSwzMSw2NGExMC42NSwxMC42NSwwLDAsMC0xMy42MS42MUwzLjMzLDc3LjQ1YTEwLjY4LDEwLjY4LDAsMCwwLDAsMTUuNzhMNDEuNDQsMTI4LDMuMzIsMTYyLjc3YTEwLjY4LDEwLjY4LDAsMCwwLDAsMTUuNzhsMTQuMSwxMi44MkExMC42NSwxMC42NSwwLDAsMCwzMSwxOTJMNzUsMTU4LjYxbDEwMC45LDkyLjA2QTE1Ljk0LDE1Ljk0LDAsMCwwLDE4MS4zOCwyNTQuMjVabTEwLjUtMTg0LjM2TDExNS4zMiwxMjhsNzYuNTYsNTguMTJaIi8+PC9nPjwvZz48L3N2Zz4=)](https://marketplace.visualstudio.com/items?itemName=antfu.vue-i18n-ally)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/antfu.vue-i18n-ally.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=antfu.vue-i18n-ally)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/antfu.vue-i18n-ally.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=antfu.vue-i18n-ally)


## ⚡ Features

- Inline annotation
- i18n key autocomplete
- Friendly UI for managing locales
- One-click machine translation
- Extract text from code
- JSON and YAML supported
- Multi-root workspace
- Translating progress
- Supporting both [`vue-i18n`](https://github.com/kazupon/vue-i18n), [`vuex-i18n`](https://github.com/dkfbasel/vuex-i18n) and [`vue-i18next`](https://github.com/panter/vue-i18next)

![](https://raw.githubusercontent.com/antfu/vue-i18n-ally/master/screenshots/overview.png)


## ⚙ Installation

1. Install [`vue-i18n`](https://github.com/kazupon/vue-i18n) package if you haven't yet. `npm i vue-i18n` or `yarn add vue-i18n`
2. Install this extension
3. `locales` path will be detected automatically. You can also configure it manually. There are two ways to do that:
   - Open **Command Palette** (`Ctrl-Shift-P` or `⌘⇧P`), type `Vue i18n Ally: Manual configure locales path` then press enter and follow the guide.
   - Modify the `settings.json` file of your VSCode, adding `vue-i18n-ally.localesPath` manually.

## 📂 Directory structure

You can have locales directory structured like this

```
  locales         # you can specify the folder path in the settings
  ├── en.json
  ├── de-DE.json
  ├── zh-CN.yaml  # YAML is also supported
  ├── zh-TW.yaml
  ├── ...
  └── <contry-code>.json
```

or

```
  locales
  ├── en
  |   ├── common.json
  |   ├── buttons.json
  |   ├── ...
  |   └── <filenames>.json
  ├── de-DE
  |   ├── common.json
  |   ├── buttons.json
  |   └── ...
  └── <contry-code>
      ├── common.json
      ├── buttons.json
      └── ...
```

Currently we support `json` or `yaml` as your locales file type.

If you would like use different file formats or directory structures, it welcome to open an issue or pull request.

### ⚗ Experimental `.js` support

From v0.16.x, we shipped the support for loading '*.js' locale files.

Something like this:

```js
// locales/en.js
export default {
  intro: {
    text: 'Welcome to the <span class="highlight">awesome</span> TooDoo App'
  },

  about: {
    name: 'About',
    text: 'This is a small sample app to illustration internationalization with the vuex-i18n plugin.',
    link: 'Back to my list'.toUpperCase() // you can run some code if you want
  }
}
```

Although there are some limitations:

### No editting / translating
Sine javascript can be very complex and there is not a proper way the let machine decide where to write the changes. We disabled any writing features on ".js" locales and will never support it.

### No reload on file changes 🐞
This is a bug cause by `esm`'s cache. It will be fixed in the future release.

## 📅 TODOs

We have not determined schedule to implement the TODOs. If you would like to see them implemented, please open an issue and share your use cases.

PR to implement any of the following features is also welcome. ☺

- [x] Machine translating
- [x] Locales Tree
- [x] Translating progress
- [x] Workspace support
- [x] Underscore for i18n keys
- [x] YAML support
- [x] `$tc`, `$d`, `$n`, `v-t` support
- [x] Hide/Show specific locales
- [x] Screenshots
- [x] Language flags
- [x] Loading `.js` locales
- [x] Goto definition
- [x] Source language indicator
- [ ] Find all usage
- [ ] [Refactor](https://code.visualstudio.com/api/references/vscode-api#CodeAction)
- [ ] [Vue inlined locales support](http://kazupon.github.io/vue-i18n/guide/sfc.html)
- [ ] Analysis report
- [ ] JSON/YAML file annonation & hint
- [ ] Loading `.ts` locales
- [ ] Annoation config (on/off, maxlength)
- [ ] Force enabled on non-vue-i18n project
- [ ] i18n for the plugin itself
- [ ] tests
- [ ] RED for missing keys

## 👨‍💻 Credits

This extension is original forked from [think2011/vscode-vue-i18n](https://github.com/think2011/vscode-vue-i18n), it can't be existed without [@think2011](https://github.com/think2011)'s great work.

## License

[MIT License](https://github.com/antfu/vue-i18n-ally/blob/master/LICENSE) © 2019 [Anthony Fu](https://github.com/antfu)

MIT License © 2018-2019 [think2011](https://github.com/think2011)
