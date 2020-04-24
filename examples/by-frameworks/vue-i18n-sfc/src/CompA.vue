<template>
  <div>
    <p>Language: {{ $t('language') }}</p>
    <p>A: {{ $t('hello') }}</p>
  </div>
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

<i18n lang='yaml' locale='en'>
language: English
</i18n>

<i18n lang='yaml' locale='ja'>
language: 日本語
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
    },
  },
}
</script>
