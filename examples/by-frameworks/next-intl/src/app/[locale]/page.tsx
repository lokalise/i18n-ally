'use client'

import { useTranslations } from 'next-intl'

export default function IndexPage() {
  const t = useTranslations('IndexPage')

  t('title')
  t.rich('title')
  t.raw('title')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Test1 />
      <Test2 />
    </div>
  )
}

function Test1() {
  const t = useTranslations('Test')
  return <p>{t('title')}</p>
}

function Test2() {
  const t = useTranslations()
  return <p>{t('Test.title')}</p>
}
