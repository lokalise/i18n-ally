<template lang="pug">
.flag-icon(:style='style')
  img(:src='src' v-bind='$attrs' :width='size || "20"' :height='size || "20"')
  .locale-label.monospace(v-if='label') {{locale}}
</template>

<script lang="ts">
import Vue from 'vue'
import { getFlagFilename } from '../../utils/locale'

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
      return `${this.$store.state.config.extensionRoot}/res/flags/${getFlagFilename(this.locale)}`
    },
    style() {
      if (this.label) {
        return {
          width: '40px',
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

  img
    margin auto
    display block

  .locale-label
    font-size 0.7em
    opacity 0.6
    line-height 1em
</style>
