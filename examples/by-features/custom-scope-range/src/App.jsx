/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-use-before-define
import React from 'react'
import { Trans } from 'react-i18next'
import { customScopeRangeFn } from './customScopeRange'
import './App.css'

// Component using the Trans component
function MyComponent() {
  return (
    <Trans i18nKey="translation:description.part1">
      To get started, edit <code>src/App.js</code> and save to reload.
    </Trans>
  )
}

// page uses the hook
function Page() {
  const { t } = customScopeRangeFn()

  return (
    <div className="App">
      <div className="App-intro">
        <MyComponent />
      </div>
      <div>{t('translation:description.part2')}</div>
      {/* plain <Trans>, #423 */}
      <Trans i18nKey="translation:description.part2">Fallback text</Trans>
    </div>
  )
}

// function with scope
function Page2() {
  const { t } = customScopeRangeFn(['translation:foo'])

  // inside default namespace ("foo.bar")
  t('bar')

  // explicit namespace
  t('pages.home:title')
  t('pages/home:title')
}

// function with another scope
function Page3() {
  const { t } = customScopeRangeFn('pages/home')

  t('title')

  // explicit namespace
  t('translation:title')
}

// function with scope in options
function Page4() {
  const { t } = customScopeRangeFn('pages/home')

  t('title')

  // explicit namespace
  t('title', { ns: 'translation' })
}

// component with scope in props
function Page5() {
  const { t } = customScopeRangeFn('pages/home')

  return (
    <div className="App">
      <Trans t={t} i18nKey="title"></Trans>
      {/* explicit namespace */}
      <Trans t={t} i18nKey="title" ns="translation"></Trans>
    </div>
  )
}
