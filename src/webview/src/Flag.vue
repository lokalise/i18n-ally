<template lang="pug">
.flag-icon(:style='style')
  img(
    v-if='$store.state.config.showFlags'
    v-bind='$attrs'
    :src='src'
    :width='size || "20"'
    :height='size || "20"'
  )
  .locale-label.monospace(v-if='label') {{locale}}
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  inheritAttrs: false,

  props: {
    locale: { type: String, default: 'en' },
    size: { type: String, default: '20' },
    label: { type: Boolean, default: true },
  },

  computed: {
    src() {
      // @ts-ignore
      const idx = this.$store.state.config.locales.indexOf(this.locale)
      // @ts-ignore
      const flag = this.$store.state.config.flags[idx]
      if (!flag)
        return ''
      // @ts-ignore
      return `${this.$store.state.config.extensionRoot}/res/flags/${flag}.svg`
    },
    style() {
      if (this.label) {
        return {
          width: '50px',
        }
      }
      return {}
    },
  },
})
</script>

<style lang="stylus" scoped>
.flag-icon
  padding 3px
  text-align center
  margin auto

  img
    margin auto
    display block

  .locale-label
    font-size 0.7em
    opacity 0.6
    line-height 1em
    white-space nowrap
    text-overflow ellipsis
    overflow hidden
</style>
