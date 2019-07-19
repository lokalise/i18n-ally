<template>
  <p>A: {{ $t('hello') }}</p>
</template>

<i18n>
{
  "en": {
    "hello": "hello world A!"
  },
  "ja": {
    "hello": "こんにちは、世界 A！"
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
