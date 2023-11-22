import { useTranslations } from 'next-intl'

export default function UseTranslationsTest2() {
  const t = useTranslations()
  return <p>{t('Test.title')}</p>
}
