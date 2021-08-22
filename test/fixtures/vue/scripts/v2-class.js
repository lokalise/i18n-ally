import Vue from 'vue'
import Component from 'nuxt-class-component'
export default

@Component({
  props: {
    env: String
  }
})
class Base extends Vue {
  // initial data
  // TODO: Remove when upgrade babel-preset-env
  // eslint-disable-next-line no-undef
  msg = 123
  // lifecycle hook
  mounted () {
    this.greet()
  }
  // computed
  get computedMsg () {
    return 'computed ' + this.msg
  }
  // method
  greet () {
    console.log('base greeting: ' + this.msg) // eslint-disable-line no-console
  }
}
