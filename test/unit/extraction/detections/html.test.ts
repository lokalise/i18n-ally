import { expect } from 'chai'
import { extractionsParsers } from '../../../../src/extraction'

const html = extractionsParsers.html

describe('detections', () => {
  describe('attrs', () => {
    it('html', () => {
      expect(html.detect('<div placeholder="Hello"></div>')).to.matchSnapshot()

      expect(html.detect(`
<textarea
  class="form-control"
  rows="8"
  v-model="article.body"
  placeholder="Write your article (in markdown)"
  ></textarea>
`)).to.matchSnapshot()

      expect(html.detect('<img src="{{ img_url }}" title="This is a title" alt="This is an alt.">')).to.matchSnapshot()
      expect(html.detect('<img src="https://example.com/img.svg" :title="image" alt="img.svg">')).eql([])
    })

    it('vue-favored attrs', () => {
      expect(html.detect(
        // eslint-disable-next-line no-template-curly-in-string
        '<input v-bind:placeholder="\'Placeholder \' + input_name" :title="`${input_name} title`" name="email">'),
      ).to.matchSnapshot()
    })
  })

  describe('inline', () => {
    it('plain text', () => {
      expect(html.detect('<p>Popular Tags</p>')).to.matchSnapshot()
    })

    it('mixed text', () => {
      expect(html.detect(`
<p>
  <router-link :to="{ name: 'login' }">Sign in</router-link>
  or
  <router-link :to="{ name: 'register' }">sign up</router-link>
  to add comments on this article.
</p>`)).to.matchSnapshot()
    })

    it('vue-favored variables', () => {
      expect(html.detect('<p>Using mustaches: {{ rawHtml }}</p>')).to.matchSnapshot()
    })

    it('ignore translated keys', () => {
      expect(html.detect('<p>{{ $t("hello.world") }}</p>').length).to.eq(0)
      expect(html.detect('<p :placeholder="t(`hello.world`)"></p>').length).to.eq(0)
      expect(html.detect('<p :placeholder="hello + world"></p>').length).to.eq(0)
    })

    it('multiple lines', () => {
      expect(html.detect(`
<p>
  Using
  v-html
  directive:
  <span v-html="rawHtml"></span>
</p>
`)).to.matchSnapshot()
    })

    it('invalid', () => {
      expect(html.detect('<p>class.name</p>')).eql([])
      expect(html.detect('<p> {{ $t("hello") }} </p>')).eql([])
    })

    it('exclude tag', () => {
      expect(html.detect('<script>Hello</script>')).eql([])
      expect(html.detect('<style lang="ts">Hello</style>')).eql([])
    })
  })
})
