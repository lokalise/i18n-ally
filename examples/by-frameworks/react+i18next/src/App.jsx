/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Component } from 'react'
import { useTranslation, withTranslation, Trans } from 'react-i18next'
import './App.css'

// use hoc for class based components
class LegacyWelcomeClass extends Component {
  render() {
    const { t } = this.props
    const intl = useIntl()
    return (
      <div>
        <h2>{t('title')}</h2>
        <h2>{intl.formatPlural({ id: 'title' })}</h2>
        <h2>{intl.formatMessage({ id: 'title' })}</h2>
      </div>
    )
  }
}
const Welcome = withTranslation()(LegacyWelcomeClass)

// Component using the Trans component
function MyComponent() {
  return (
    <Trans i18nKey="description.part1">
      To get started, edit <code>src/App.js</code> and save to reload.
    </Trans>
  )
}

// page uses the hook
function Page() {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="App">
      <div className="App-header">
        <Welcome />
        <button onClick={() => changeLanguage('de')}>de</button>
        <button onClick={() => changeLanguage('en')}>en</button>
      </div>
      <div className="App-intro">
        <MyComponent />
      </div>
      <div>{t('description.part2')}</div>
    </div>
  )
}

// hook with scope
function Page2() {
  const { t } = useTranslation('foo')

  // inside default namespace ("foo.bar")
  t('bar')

  // explicit namespace
  t('description:part1')
}

// hook with another scope
function Page3() {
  const { t } = useTranslation('description')

  t('part1')

  // explicit namespace
  t('foo:bar')
}
