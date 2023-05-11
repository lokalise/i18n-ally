'use client'

import { useTranslations } from 'next-intl'

export default function IndexPage() {
  const t = useTranslations('IndexPage')

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}
