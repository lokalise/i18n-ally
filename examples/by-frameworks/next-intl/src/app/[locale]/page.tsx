
import { useTranslations } from 'next-intl'
import { getTranslator } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslator(locale, 'Metadata')

  return {
    title: t('title'),
  }
}

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
      <Test3 />
      <Test4 />
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

function Test3() {
  const t = useTranslations('Test')
  return <p>{t('title')}</p>
}

function Test4() {
  const t = useTranslations()
  return <p>{t('IndexPage.title')}</p>
}
