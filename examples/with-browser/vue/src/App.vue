<template lang='pug'>
#app
  i18n-ally(path='title' tag='h1')

  select(v-model='$i18n.locale')
    option(v-for='locale of $i18n.availableLocales') {{locale}}

  br
  br

  i18n-ally(path='intro' tag='p')
</template>

<script>
import i18nAlly from './i18n-ally.vue'

export default {
  name: 'App',
  components: {
    i18nAlly,
  },
  watch: {
    '$i18n.locale': function() {
      localStorage.setItem('locale', this.$i18n.locale)
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
