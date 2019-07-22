<template>
  <div id="app">
    <p>{{ $t('project') }}</p>
    <p>{{ $t('not_exists') }}</p>
  </div>
</template>

<script>
export default {
  name: 'App',

  computed: {
    foobar () {
      return this.$t('nested.foo.bar')
    },
  },
}
</script>
