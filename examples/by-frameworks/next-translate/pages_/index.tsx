import React from 'react'

// @ts-ignore
import Link from 'next-translate/Link'

// @ts-ignore
import useTranslation from 'next-translate/useTranslation'
// @ts-ignore
import Header from '../components/header'

// @ts-ignore
export default function Home(props) {
  const { t } = useTranslation()
  const description = t('home:description')
  const linkName = t('home:more-examples')

  console.log(props)

  return (
    <>
      <Header />
      <p>{description}</p>
      <Link href="/more-examples">
        <a>{linkName}</a>
      </Link>
    </>
  )
}

// @ts-ignore
export async function getStaticProps({ lang }) {
  return { props: { getStaticPropsWorks: true, lang } }
}
