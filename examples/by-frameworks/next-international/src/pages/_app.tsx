import { I18nProvider } from '../locales'
import { AppProps } from 'next/app'
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider locale={pageProps.locale}>
      <Component {...pageProps} />
    </I18nProvider>
  )
}