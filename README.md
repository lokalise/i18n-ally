<img src="https://raw.githubusercontent.com/antfu/vue-i18n-ally/master/static/logo.png" alt="logo" width="150" align="right"/>

# Vue i18n Ally

🌍 Better [Vue i18n](https://github.com/kazupon/vue-i18n) experiences with VSCode

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/antfu.vue-i18n-ally.svg?style=flat-square)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/antfu.vue-i18n-ally.svg?style=flat-square)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/antfu.vue-i18n-ally.svg?style=flat-square)


## ⚡ Features

- Inline annotation
- i18n key autocomplete
- Friendly UI for managing locales
- One-click machine translation
- Extract text from code
- JSON and YAML supported
- Multi-root workspace
- Translating progress

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

## 📅 TODO

- [x] Machine translating
- [x] Locales Tree
- [x] Translating progress
- [x] [Workspace support](https://github.com/microsoft/vscode-extension-samples/blob/master/basic-multi-root-sample/src/extension.ts)
- [x] Underscore for i18n keys?
- [x] YAML support
- [x] `$tc`, `$d`, `$n`, `v-t` support
- [x] Hide/Show specific locales
- [x] Screenshots
- [x] Language flags
- [ ] [Vue inlined locales support](http://kazupon.github.io/vue-i18n/guide/sfc.html)
- [ ] Source language indicator
- [ ] Analysis report
- [ ] JSON/YAML file annonation & hint
- [ ] Annoation config (on/off, maxlength)
- [ ] Force enabled on non-vue-i18n project
- [ ] i18n for the plugin itself

## 👨‍💻 Credits

This extension is original forked from [think2011/vscode-vue-i18n](https://github.com/think2011/vscode-vue-i18n), it can't be existed without [@think2011](https://github.com/think2011)'s great work.

## License

[MIT License](https://github.com/antfu/vue-i18n-ally/blob/master/LICENSE) © 2019 [Anthony Fu](https://github.com/antfu)

MIT License © 2018-2019 [think2011](https://github.com/think2011)
