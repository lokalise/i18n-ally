<template lang="pug">
.container
  template(v-if='$store.state.ready')
    .nav-bar
      img.logo(:src='logo' width='40' height='40')
      .title i18n Ally Editor
      flag(:locale='state.config.sourceLanguage' size='20')
      button(@click='refresh').pa-2 Refresh

    .content
      key-editor(v-if='state.route === "edit-key"' :data='state.routeData')

    pre {{JSON.stringify(state, null, 2)}}
  template(v-else)
    p Loading...
</template>

<script lang="js">
import Vue from 'vue'
import Flag from './Flag.vue'
import KeyEditor from './KeyEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    KeyEditor,
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
  .nav-bar
    padding 12px 0
    display grid
    grid-template-columns max-content auto max-content max-content

    & *
      vertical-align middle

  .title
    font-size 1.2em
    margin auto 8px

  .logo
    margin auto

.monospace
  font-family var(--vscode-editor-font-family)

button
  color var(--vscode-foreground)
  background var(--vscode-background)
  border-color var(--vscode-button-background)
  border-radius 5px
  cursor pointer

  &:hover
    color var(--vscode-editor-background)
    background var(--vscode-foreground)

</style>
