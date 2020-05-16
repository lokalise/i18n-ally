import React from 'react'
import Head from 'next/head'
import Link from 'next-translate/Link'
import Router from 'next-translate/Router'
import useTranslation from 'next-translate/useTranslation'

import styles from './header.module.css'

export default function Header() {
  const { t, lang } = useTranslation()
  const title = t('common:title')

  function changeToEn() {
    Router.pushI18n({ url: '/', options: { lang: 'en' } })
  }

  return (
    <>
      <Head>
        <title>
          {title} | ({lang.toUpperCase()})
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <h1>{title}</h1>
        {lang !== 'es' && (
          <Link href="/" lang="es">
            <a>Español</a>
          </Link>
        )}
        {lang !== 'ca' && (
          <Link href="/" lang="ca">
            <a>Català</a>
          </Link>
        )}
        {lang !== 'en' && (
          <>
            <Link href="/" lang="en">
              <a>English</a>
            </Link>
            <button onClick={changeToEn}>English Router.push</button>
          </>
        )}
      </header>
    </>
  )
}
