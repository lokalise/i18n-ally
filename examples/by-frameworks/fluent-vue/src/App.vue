<template>
  <div>
    <!-- Methods -->
    <div>{{ $t('test') }}</div>
    <div v-bind="$ta('props')" />

    <!-- Directive -->
    <div v-t:test />
    <div v-t:greeting="{ name: username }" />

    <!-- Component -->
    <i18n path="term" tag="span">
      <template #tos-link="{ termsLinkText }">
        <RouterLink to="/login/register">
          {{ termsLinkText }}
        </RouterLink>
      </template>
    </i18n>

    <div>
      Plain text to extract
    </div>
  </div>
</template>

<script>
import { useFluent } from 'fluent-vue'

export default {
  setup() {
    const { $t } = useFluent()

    return {
      test: $t('test'),
    }
  },
  computed: {
    username() {
      return this.$t('user-name')
    },
    notExists() {
      return this.$t('wrong-key')
    },
    plainText() {
      return "Plain text in js to extract"
    },
  },
}
</script>
