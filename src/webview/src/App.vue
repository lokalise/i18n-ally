<template lang="pug">
.container
  template(v-if='$store.state.ready')
    .nav-bar
      img.logo(:src='logo' width='40' height='40')
      .nav-middle
        .title i18n Ally Editor
        span.button(@click='refresh') Refresh
      flag(:locale='state.config.sourceLanguage' size='20')
      v-cog.setting-button

    .content
      key-editor(v-if='state.route === "edit-key"' :data='state.routeData')

    // pre {{JSON.stringify(state.config, null, 2)}}
  template(v-else)
    p Loading...
</template>

<script lang="js">
import Vue from 'vue'
import VCog from 'vue-material-design-icons/Cog.vue'
import Flag from './Flag.vue'
import KeyEditor from './KeyEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    KeyEditor,
    VCog,
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

  padding-bottom 12px

  .nav-bar
    padding 12px 0
    display grid
    grid-template-columns max-content auto max-content max-content

    & *
      vertical-align middle

  .nav-middle
    margin auto 12px

  .title
    font-size 1.2em

  .logo
    margin auto

  .setting-button
    font-size 1.8em
    margin-bottom 10px
    opacity 0.6
    cursor pointer

    &:hover
      opacity 0.9

.monospace
  font-family var(--vscode-editor-font-family)

.button
  cursor pointer
  position relative
  padding 4px 8px
  font-size 0.8em
  display inline-block

  .material-design-icon
    font-size 1.2em
    margin-top -1px
    margin-bottom -1px
    margin-left -3px
    margin-right 2px

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
    margin 4px 8px 4px 0
</style>
