// https://github.com/nuxt/nuxt.js/blob/dev/examples/hello-world/pages/about.vue
export default {
  asyncData () {
    return {
      name: process.static ? 'static' : (process.server ? 'server' : 'client')
    }
  },
  head: {
    title: 'About page'
  }
}
