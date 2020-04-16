<template lang="pug">
.container
  template(v-if='$store.state.ready')
    .nav-bar
      img.logo(:src='logo')
      .nav-middle
        .title {{ $t('editor.title') }}
      div
        v-refresh.setting-button(@click='refresh') Refresh
        v-cog.setting-button

    .content
      key-editor(v-if='state.route === "edit-key"' :data='state.routeData')

    // pre {{JSON.stringify(state.i18n, null, 2)}}
  template(v-else)
    p Loading...
</template>

<script lang="js">
import Vue from 'vue'
import VCog from 'vue-material-design-icons/Cog.vue'
import VRefresh from 'vue-material-design-icons/Refresh.vue'
import Flag from './Flag.vue'
import KeyEditor from './KeyEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    KeyEditor,
    VCog,
    VRefresh,
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
      this.postMessage({ name: 'refresh' })
    },
  },
})
</script>

<style lang="stylus">
.container
  --review-approve #768741
  --review-request-change #d8583e
  --review-comment #EFC73D
  user-select none
  font-size 1.1em
  padding-bottom 1.5em

  .nav-bar
    padding 1.2em 0
    display grid
    grid-template-columns max-content auto max-content max-content

    & *
      vertical-align middle

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
    margin-left 0.4em
    opacity 0.4
    cursor pointer

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
</style>
