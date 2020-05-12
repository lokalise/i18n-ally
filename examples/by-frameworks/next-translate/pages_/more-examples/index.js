import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import Link from 'next-translate/Link'

import PluralExample from '../../components/plural-example'
import Header from '../../components/header'
import NoFunctionalComponent from '../../components/no-functional-component'

const Component = props => <p {...props} />

export default function MoreExamples() {
  const { t } = useTranslation()
  const exampleWithVariable = t('more-examples:example-with-variable', {
    count: 42,
  })

  return (
    <>
      <Header />
      <h2>{exampleWithVariable}</h2>
      <PluralExample />
      <Trans
        i18nKey="more-examples:example-with-html"
        components={[<Component />, <b style={{ color: 'red' }} />]}
      />
      <NoFunctionalComponent />
      <br />
      {t`more-examples:nested-example.very-nested.nested`}
      <br />
      <Link href="/more-examples/dynamic-namespace">
        <a>{t('more-examples:dynamic-namespaces-link')}</a>
      </Link>
    </>
  )
}
