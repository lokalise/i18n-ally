// import the webdriver and the high level browser wrapper
import { expect } from 'chai'
import { getContext, getElementPooling, gotoFile, openFixture } from './utils'

describe('vue-i18n', () => {
  it('welcome', async() => {
    const { driver } = getContext()
    const title = await driver.getTitle()
    expect(title.startsWith('Welcome')).to.eql(true)
  })

  it('activate i18n Ally', async() => {
    const { driver } = await openFixture('examples/by-frameworks/vue-i18n')
    const title = await driver.getTitle()
    expect(title).to.eql('Welcome — vue-i18n')

    await gotoFile('App.vue')

    const entry = await getElementPooling(driver, { className: 'activity-workbench-view-extension-i18n-ally' })
    await entry.click()

    const viewTitle = await getElementPooling(driver, { className: 'composite' })
    expect((await viewTitle.getText()).toLowerCase()).to.eql('i18n ally')
  })
})
