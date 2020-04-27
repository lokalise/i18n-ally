<template>
  <div id="app">
    <p>{{ $t('project') }}</p>
    <p>{{ $t('hello') }}</p>

    <p>{{ $tc('today') }}</p>
    <p>{{ $tc('now') }}</p>
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
