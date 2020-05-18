<template lang="pug">
.sidebar
  .keys
    .item.panel(
      v-if='contextKeys'
      v-for='(key, idx) in contextKeys'
      :key='key'
      :class='{active: idx === keyIndex, empty: !key.value}'
      @click='gotoKey(idx)'
    )
      .key {{key.key}}
      .value {{key.value || $t('editor.empty')}}

  .resize-handler
    .inner
</template>

<script>
import Vue from 'vue'
import common from '../mixins/common'

export default Vue.extend({
  mixins: [common],
})
</script>

<style lang="stylus">
.sidebar
  overflow-y auto
  overflow-x hidden
  position relative
  padding var(--i18n-ally-margin)

  .resize-handler
    position absolute
    top 0
    right -6px
    bottom 0
    padding 0 6px
    cursor ew-resize

    .inner
      height 100%
      width 1px
      background var(--vscode-foreground)
      pointer-events none
      opacity 0
      transition .2s ease-in-out

    &:hover .inner
      opacity 0.5

  .keys
    display grid
    grid-template-rows auto
    grid-gap 0.4em
    overflow-x auto

    .item
      cursor pointer

      &::before
        opacity 0.03

      &.active
        opacity 1
        cursor default

      &.active::before
        opacity 0.1

      &::after
        opacity 0 !important

      .key
        font-size 0.9em
        font-family var(--vscode-editor-font-family)
        opacity 0.7
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        width 100%

      .value
        font-size 0.7em
        text-overflow ellipsis
        opacity .5
        width 100%
        white-space nowrap
        overflow hidden
        opacity 0.5

      &.empty
        .key
          color orange
        .value
          opacity 0.2
</style>
