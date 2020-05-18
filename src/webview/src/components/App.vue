<template lang="pug">
.container
  template(v-if='$store.state.ready')
    navbar

    .layout(
      :class='{"with-sidebar": sidebar}'
      @mousedown='onMousedown'
      @mouseup='dragging=false'
      @mousemove='onMove'
    )
      sidebar(:style='{width: sidebarWidth +"px"}' v-if='sidebar')
      key-editor(v-if='state.route === "open-key"' :data='state.routeData')

  template(v-else)
    p.loading Loading...
</template>

<script lang="js">
import Vue from 'vue'
import common from '../mixins/common'
import KeyEditor from './KeyEditor.vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

export default Vue.extend({
  components: {
    KeyEditor,
    Navbar,
    Sidebar,
  },
  mixins: [common],
  data() {
    return {
      dragging: false,
      sidebarWidth: 150,
    }
  },
  methods: {
    onMousedown(e) {
      if (e.target.className === 'resize-handler')
        this.dragging = true
    },
    onMove(e) {
      if (this.dragging)
        this.sidebarWidth = Math.min(Math.max(100, e.clientX - 20), window.innerWidth * 0.6)
    },
  },
})
</script>

<style lang="stylus">
:root
  --i18n-ally-margin 0.8rem

body
  padding 0

.container
  --review-approve #768741
  --review-request-change #d8583e
  --review-comment #EFC73D
  user-select none
  font-size 1.1em
  padding-bottom 1.5em

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

    &:hover
      opacity 0.9

.layout
  display grid
  &.with-sidebar
    grid-template-columns max-content auto

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
    margin 0 0.6em 0 0

    &:last-child
      margin 0 0.3em 0 0

p.loading
  padding var(--i18n-ally-margin)
</style>
