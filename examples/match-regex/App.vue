<template>
  <div id="app">
    <p>{{ $t('project') }}</p>
    <p>{{ $t('not_exists') }}</p>

    <!-- Pluralization -->
    <p>{{ $tc('car', 2) }}</p>
    <p>{{ $tc('apple', 10, { count: 10 }) }}</p>
    <p>{{ $tc('apple', 10) }}</p>

    <p v-t="'nested.hello'" />
    <p v-t="&quot;nested.greeting&quot;" />
    <p v-t="invalid" />

    <!-- Component interpolation -->
    <i18n path="term" tag="label" for="tos">
      <a :href="url" target="_blank">{{ $t('tos') }}</a>
    </i18n>
  </div>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    invalid: 'invalid',
  }),

  computed: {
    foobar () {
      return this.$t('nested.foo.bar')
    },
    exists () {
      return this.$te('nested.foo.bar')
    },
  },
}
</script>
