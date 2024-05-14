import { getTranslations } from 'next-intl/server'

export default async function GetTranslationsTest3() {
  const t = await getTranslations({
    locale: 'en',
    namespace: 'IndexPage',
  })
  return <p>{t('title')}</p>
}
