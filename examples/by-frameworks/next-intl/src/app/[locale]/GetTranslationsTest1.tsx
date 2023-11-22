import { getTranslations } from 'next-intl/server'

export default async function GetTranslationsTest1() {
  const t = await getTranslations()
  return <p>{t('IndexPage.title')}</p>
}
