<template>
  <div id="app">
    <p>{{ $t('intro') }}</p>
    <p>{{ $t('hello') }}</p>
    <p>{{ $t('not_exist') }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    foobar() {
      return this.$t('good_morning')
    },
  },
}
</script>
