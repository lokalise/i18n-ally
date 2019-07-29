<template>
  <div id="app">
    <label for="locale">locale</label>
    <select v-model="locale">
      <option>en</option>
      <option>ja</option>
    </select>
    <comp-a :locale="locale" />
    <comp-b :locale="locale" />
    <p>App: {{ $t('hello') }}</p>
  </div>
</template>

<i18n>
{
  "en": {
    "hello": "hello world!"
  },
  "ja": {
    "hello": "こんにちは、世界！"
  }
}
</i18n>

<script>
import CompA from './CompA.vue'
import CompB from './CompB.vue'

export default {
  name: 'App',
  components: {
    CompA,
    CompB,
  },
  data () {
    return {
      locale: 'en',
    }
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    },
  },
}
</script>
