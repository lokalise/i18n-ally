<template>
  <div id="app">
    <p>{{ $t('hello') }}</p>

    <p v-t="'nested.hello'"></p>
  </div>
</template>


<script>
export default {
  computed: {
    foobar() {
      return this.$t('nested.foo.bar')
    },
  },
}
</script>
