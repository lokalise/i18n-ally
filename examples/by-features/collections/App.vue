<template>
  <div id="app">
    <!-- basic -->
    <p>{{ $t('key1') }}</p>
    <!-- nested -->
    <p>{{ $t('nested.message1') }}</p>
    <!-- array -->
    <p>{{ $t('errors[0]') }}</p>
    <!-- object in array -->
    <p>{{ $t('errors.1.internal1') }}</p>
    <!-- array in array -->
    <p>{{ $t('errors[2][0]') }}</p>
  </div>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    invalid: 'invalid',
  }),

  computed: {
    foobar() {
      return this.$t('nested.foo.bar')
    },
    exists() {
      return this.$te('nested.foo.bar')
    },
  },
}
</script>
