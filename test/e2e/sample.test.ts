// import the webdriver and the high level browser wrapper
import { expect } from 'chai'
import { getContext, openFixture } from './utils'

describe('sample', () => {
  it('welcome', async() => {
    const { driver } = getContext()
    const title = await driver.getTitle()
    expect(title.startsWith('Welcome')).to.eql(true)
  })

  it('open fixture', async() => {
    const { driver } = await openFixture('examples/by-frameworks/vue-i18n')
    const title = await driver.getTitle()
    expect(title).to.eql('Welcome — vue-i18n')
  })
    .timeout(60_000)
})
