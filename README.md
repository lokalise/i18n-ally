<img src="https://raw.githubusercontent.com/antfu/vue-i18n-ally/master/static/logo.png" alt="logo" width="150" align="right"/>

# Vue i18n Ally

🌍 Better [Vue i18n](https://github.com/kazupon/vue-i18n) experiences with VSCode

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/antfu.vue-i18n-ally.svg?color=blue&style=flat-square&label=VSCode%20Marketplace&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjM0IDIzNS4xIiB3aWR0aD0iMjQ4OCIgaGVpZ2h0PSIyNTAwIj48c3R5bGU%2BLnN0MHtmaWxsOiMwMTc5Y2J9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNODMuMyAxNDMuOWwtNTggNDUuMkwwIDE3Ni41VjU4LjdMMjUuMiA0Nmw1Ny42IDQ1LjNMMTc0IDBsNjAgMjMuOXYxODYuOWwtNTkuNyAyNC4zLTkxLTkxLjJ6bTg4LjkgMTUuOVY3NS4zbC01NC42IDQyLjMgNTQuNiA0Mi4yek0yNy4zIDE0NC42TDU2IDExOC41IDI3LjMgODkuOXY1NC43eiIvPjwvc3ZnPg%3D%3D)](https://marketplace.visualstudio.com/items?itemName=antfu.vue-i18n-ally)
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

From v0.16.x, we shipped the support for loading javascript locale files.

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
    link: 'Back to my list'.toUpperCase()
  }
}
```

Although there are some limitations:

### No editting / translating
Sine javascript can be very complex and there is not a proper way the let machine decide where to write the changes. We disabled any writing features on ".js" locales and will never support it.

### No reload on file changes 🐞
This is a bug cause by `esm`'s cache. It will be fixed in the future release.

## 📅 TODO

- [x] Machine translating
- [x] Locales Tree
- [x] Translating progress
- [x] Workspace support
- [x] Underscore for i18n keys?
- [x] YAML support
- [x] `$tc`, `$d`, `$n`, `v-t` support
- [x] Hide/Show specific locales
- [x] Screenshots
- [x] Language flags
- [x] `.js` locales
- [ ] [Vue inlined locales support](http://kazupon.github.io/vue-i18n/guide/sfc.html)
- [ ] Source language indicator
- [ ] Analysis report
- [ ] JSON/YAML file annonation & hint
- [ ] Annoation config (on/off, maxlength)
- [ ] Force enabled on non-vue-i18n project
- [ ] i18n for the plugin itself
- [ ] tests

## 👨‍💻 Credits

This extension is original forked from [think2011/vscode-vue-i18n](https://github.com/think2011/vscode-vue-i18n), it can't be existed without [@think2011](https://github.com/think2011)'s great work.

## License

[MIT License](https://github.com/antfu/vue-i18n-ally/blob/master/LICENSE) © 2019 [Anthony Fu](https://github.com/antfu)

MIT License © 2018-2019 [think2011](https://github.com/think2011)
