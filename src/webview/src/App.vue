<template lang="pug">
.container
  template(v-if='$store.state.ready')
    .actions-bar
      v-magnify.setting-button(@click='openSearch')
      v-refresh.setting-button(v-if='$store.state.config.debug' @click='refresh')
      v-cog.setting-button(@click='openSettings')

    key-editor(v-if='state.route === "open-key"' :data='state.routeData')

  template(v-else)
    p.loading Loading...
</template>

<script lang="js">
import Vue from 'vue'
import VCog from 'vue-material-design-icons/Cog.vue'
import VRefresh from 'vue-material-design-icons/Refresh.vue'
import VMagnify from 'vue-material-design-icons/Magnify.vue'
import Flag from './Flag.vue'
import KeyEditor from './KeyEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    KeyEditor,
    VCog,
    VRefresh,
    VMagnify,
  },

  data() {
    return {
      alive: false,
    }
  },

  computed: {
    logo() {
      return `${this.state.config.extensionRoot}/res/logo.svg`
    },
    state() {
      return this.$store.state
    },
  },

  methods: {
    postMessage(message) {
      vscode.postMessage(message)
    },
    refresh() {
      this.postMessage({ type: 'webview.refresh' })
    },
    openSettings() {
      this.postMessage({ type: 'open-builtin-settings' })
    },
    openSearch() {
      this.postMessage({ type: 'open-search' })
    },
  },
})
</script>

<style lang="stylus">
:root
  --i18n-ally-margin 0.8rem

body
  padding 0

body, html, #app
  font-family var(--vscode-font-family)

.container
  --review-approve #768741
  --review-request-change #d8583e
  --review-comment #EFC73D
  user-select none
  font-size 1.1em
  padding-bottom 1.5em

  .nav-bar
    padding 0.6em
    display grid
    grid-template-columns auto max-content

    & *
      vertical-align middle

  .actions-bar
    position absolute
    padding 1.2em
    top 0
    right 0
    z-index 10

  .nav-middle
    margin auto 1em

  .title
    font-size 1.1em

  .logo
    margin auto
    width 2.5em
    height 2.5em

  .setting-button
    font-size 1.6em
    margin-left 0.6em
    opacity 0.4
    cursor pointer

    &.small
      font-size 1em

    &:hover
      opacity 0.9

.monospace
  font-family var(--vscode-editor-font-family)

.button
  cursor pointer
  position relative
  padding 0.4em 0.8em
  font-size 0.8em
  display inline-block

  .material-design-icon
    font-size 1.2em
    margin -0.1em 0.2em -0.1em -0.2em

    &:last-child
      margin -0.1em -0.2em -0.1em -0.2em

  &::before
    content ""
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    border-radius 3px
    z-index -1
    pointer-events none
    background var(--vscode-foreground)
    opacity 0.1

  &:hover::before
    opacity 0.3

  &[disabled]
    opacity 0.4
    pointer-events none

  &.flat
    opacity 0.5

    &::before
      opacity 0

    &:hover
      opacity 1

      &::before
        opacity 0.2

  &.request-change
    &:hover::before
      background var(--review-request-change)

  &.approve
    &:hover::before
      background var(--review-approve)

  &.comment
    &:hover::before
      background var(--review-comment)

.buttons
  .button
    margin 0.3em 0.6em 0.3em 0

    &:last-child
      margin 0.3em 0.3em 0.3em 0

p.loading
  padding var(--i18n-ally-margin)
</style>
