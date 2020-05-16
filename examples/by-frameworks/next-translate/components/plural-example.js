import React, { useState, useEffect } from 'react'
import useTranslation from 'next-translate/useTranslation'

export default function PluralExample() {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(v => (v === 5 ? 0 : v + 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return <p>{t('more-examples:plural-example', { count })}</p>
}
