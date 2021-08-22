<template>
  <div id="app">
    <p>{{ $t('project') }}</p>
    <p>{{ $t('not_exists') }}</p>

    <!-- Pluralization -->
    <p>{{ $tc('car', 2) }}</p>
    <p>{{ $tc('apple', 10, { count: 10 }) }}</p>
    <p>{{ $tc('apple', 10) }}</p>

    <!-- Directive localization -->
    <p v-t="'nested.hello'" />
    <p v-t='"nested.greeting"' />
    <p v-t="invalid" />

    <!-- Component interpolation -->
    <i18n
      path="term"
      tag="label"
      for="tos"
    >
      <a
        :href="url"
        target="_blank"
      >{{ $t('tos') }}</a>
    </i18n>

    <!-- Component interpolation (Vue 3) -->
    <i18n-t keypath="term" tag="span">
      <RouterLink to="/login/register">
        {{ t('tos') }}
      </RouterLink>
    </i18n-t>
    <i18n keypath="term" tag="span">
      <RouterLink to="/login/register">
        {{ t('tos') }}
      </RouterLink>
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
    foobar() {
      return this.$t('nested.foo.bar')
    },
    exists() {
      return this.$te('nested.foo.bar')
    },
  },
}
</script>
