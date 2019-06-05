<template>
  <div id="app">
    <p>{{ $t('hello') }}</p>
    <p>This is a demo app.</p>

    <p v-t="'some.deep.nested.key'"></p>

    <p>{{ $t('intro') }}</p>
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
