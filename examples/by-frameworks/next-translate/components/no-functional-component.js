import React from 'react'
import withTranslation from 'next-translate/withTranslation'

class NoFunctionalComponent extends React.Component {
  render(){
    const { t, lang } = this.props.i18n

    return (
      <div>
        {t('more-examples:no-functional-example')}
      </div>
    )
  }
}

export default withTranslation(NoFunctionalComponent)
