<template>
  <p>B: {{ $t('global-hello') }}</p>
</template>

<i18n>
{
  "ja": {
    "global-hello": "こんにちは、世界 B！"
  }
}
</i18n>

<script>
export default {
  props: {
    locale: {
      type: String,
      default: 'en',
    },
  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    },
  },
}
</script>
