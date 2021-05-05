// https://github.com/Jolaolu/jsx-in-vue/blob/master/src/components/HelloWorld.vue
export default {
  data () {
    return {
      countries: [
        {
          name: 'Nigeria',
          description: 'Nigeria is a large country that has a varied topography.'
        }
      ]
    }
  },
  props: {
    // where you define props  to be used
    msg: String
  },
  methods: {
    // where you write methods used in your component
  },
  render () {
    return (
      <div>
        <div class="content">
          <h1>Hello, {  } </h1>
          <main class="country-wrapper">
            {
              this.countries.map(country => {
                return (
                  <div class="country-container">
                    <h3 class="country-name ">{country.name}</h3>
                    <article class="country-description">{country.description}</article>
                  </div>
                )
              })
            }
          </main>
        </div>
      </div>
    )
  }
}
