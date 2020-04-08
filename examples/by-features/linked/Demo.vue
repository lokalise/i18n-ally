<template>
  <div id="app">
    <p>{{ $t('hello') }}</p>
    <p v-t="'some.deep.nested.key'" />
    <p>{{ $t('linked') }}</p>
    <p>This is a demo app.</p>
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
