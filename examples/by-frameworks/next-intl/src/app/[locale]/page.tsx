
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import UseTranslationsTest1 from './UseTranslationsTest1'
import UseTranslationsTest2 from './UseTranslationsTest2'
import GetTranslationsTest1 from './GetTranslationsTest1'
import GetTranslationsTest2 from './GetTranslationsTest2'
import GetTranslationsTest3 from './GetTranslationsTest3'

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
  }
}

export default function IndexPage() {
  const t = useTranslations('IndexPage')

  t('title')
  t.rich('title')
  t.markup('title')
  t.raw('title')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <UseTranslationsTest1 />
      <UseTranslationsTest2 />
      <GetTranslationsTest1 />
      <GetTranslationsTest2 />
      <GetTranslationsTest3 />
      <InlineTest1 />
      <InlineTest2 />
      <InlineTest3 />
    </div>
  )
}

function InlineTest1() {
  const t = useTranslations('Test')
  return <p>{t('title')}</p>
}

function InlineTest2() {
  const t = useTranslations('IndexPage')
  return <p>{t('title')}</p>
}

async function InlineTest3() {
  const t = await getTranslations('Test')
  return <p>{t('title')}</p>
}
