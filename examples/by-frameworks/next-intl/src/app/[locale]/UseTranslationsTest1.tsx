import { useTranslations } from 'next-intl'

export default function UseTranslationsTest1() {
  const t = useTranslations('Test')
  return <p>{t('title')}</p>
}
