![](../screenshots/migration.v1.png)

# *Vue i18n Ally* is now **i18n Ally**!

This extension has reached the v1.x stage! From v1.x, we are no longer limited to only supporting Vue, but other frameworks such as React.js, Angular and more, all in one extension!

## Migration from `Vue i18n Ally` (v0.x)

There is not much to be done for this migration.

1. Install the new `i18n Ally` from [the marketplace](https://marketplace.visualstudio.com/items?itemName=antfu.i18n-ally)
2. Uninstall the old `Vue i18n Ally`.
3. You are done. 🎉

Configurations are backwards compatible. All the features for Vue will work as befores.

## New Features

- Support for Vue, React, Angular, i18next, VSCode extensions and more. Check the <a href="https://github.com/antfu/i18n-ally#-supported-frameworks" target="__blank">Supported Frameworks List</a>
- Automatically detect what frameworks are used by reading `package.json`

## Breaking Changes

- Extension and Repo are renamed to `i18n-ally`
- Config namespace is renamed to `i18n-ally` with legacy `vue-i18n-ally` backward compatibility.
- Config `forceEnabled` is deprecated. Use `enabledFrameworks` instead.
- Config `experimental.sfc` is deprecated. It will enabled automatically when you need it.

## Changes

- New Logo
- Updated documents
- `Vue i18n Ally` will disable itself when `i18n Ally` is installed.
- `i18n Ally` moved to master branch and `Vue i18n Ally` moved to branch [`v0.x`](https://github.com/antfu/i18n-ally/tree/v0.x)
