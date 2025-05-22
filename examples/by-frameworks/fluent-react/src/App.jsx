import React, { useState, useEffect } from 'react'
import { LocalizationProvider, Localized } from '@fluent/react'
import { createLocalization } from './i18n'
import './App.css'

function App() {
  const [l10n, setL10n] = useState(null)
  const [currentLocale, setCurrentLocale] = useState('en')

  useEffect(() => {
    const localization = createLocalization([currentLocale])
    setL10n(localization)
  }, [currentLocale])

  if (!l10n) {
    return <div>Loading...</div>
  }

  return (
    <LocalizationProvider l10n={l10n}>
      <div className="App">
        <header className="App-header">
          <Localized id="welcome">
            <h1>Welcome</h1>
          </Localized>

          <Localized id="description">
            <p>Description</p>
          </Localized>

          <div>
            <Localized id="current-language" vars={{ lang: currentLocale }}>
              <p>Current Language: en</p>
            </Localized>

            <Localized id="change-language">
              <button type="button" onClick={() => setCurrentLocale(currentLocale === 'en' ? 'ja' : 'en')}>
                Change Language
              </button>
            </Localized>
          </div>
        </header>
      </div>
    </LocalizationProvider>
  )
}

export default App 