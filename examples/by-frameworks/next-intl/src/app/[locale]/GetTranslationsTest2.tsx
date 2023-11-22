import { getTranslations } from 'next-intl/server'

export default async function GetTranslationsTest2() {
  const t = await getTranslations('IndexPage')
  return <p>{t('title')}</p>
}
