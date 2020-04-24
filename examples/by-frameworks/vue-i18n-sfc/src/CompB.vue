<template>
  <div>
    <p>B: {{ $t('global-hello') }}</p>
    <p>B: {{ $t('foo') }}</p>
  </div>
</template>

<i18n>
{
  "ja": {
    "global-hello": "こんにちは、世界 B！",
    "foo": "hello world A!"
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
    locale(val) {
      this.$i18n.locale = val
      this.$t('global-hello')
    },
  },
}
</script>
