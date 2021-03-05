import { expect } from 'chai'
import { extractionsParsers } from '../../../../src/extraction'

const html = extractionsParsers.html

describe('detections', () => {
  it('html', () => {
    expect(html.detect('<div placeholder="hello"></div>')).to.matchSnapshot()

    expect(html.detect(`
<textarea
  class="form-control"
  rows="8"
  v-model="article.body"
  placeholder="Write your article (in markdown)"
  ></textarea>
`)).to.matchSnapshot()

    expect(html.detect('<img src="https://example.com/img.svg" :title="image" alt="img.svg">')).to.matchSnapshot()
    expect(html.detect('<img src="{{ img_url }}" title="This is a title" alt="This is an alt.">')).to.matchSnapshot()
  })

  it('vue-favored', () => {
    expect(html.detect(
      // eslint-disable-next-line no-template-curly-in-string
      '<input v-bind:placeholder="\'Placeholder \' + input_name" :title="`${input_name} title`" name="email">'),
    ).to.matchSnapshot()
  })
})
