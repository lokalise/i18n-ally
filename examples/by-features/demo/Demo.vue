<template>
  <div id="app">
    <p>{{ $t('intro') }}</p>
    <p>{{ $t('hello') }}</p> 
  </div>
</template>

<script>
export default {
  computed: {
    foobar () {
      return this.$t('good_morning')
    },
  },
}
</script>
