<template lang="pug">
.nav-bar
  .left.buttons
    template(v-if='!context.standalone')
      .button(@click='sidebar = !sidebar')
        v-menu
      .button(@click='nextKey(-1)' :disabled='keyIndex <= 0')
        v-chevron-left
      .button(disabled) {{keyIndex + 1}} / {{contextKeys.length}}
      .button(@click='nextKey(1)' :disabled='keyIndex >= contextKeys.length - 1')
        v-chevron-right

  .right.buttons
    template(v-if='mode === "vscode"')
      .button(@click='openSearch')
        v-magnify
      .button(v-if='config.debug' @click='refresh')
        v-refresh
      .button(@click='openSettings')
        v-cog
</template>

<script>
import { api } from '../api/index'
import common from '../mixins/common'

export default {
  mixins: [common],
  methods: {
    refresh() {
      api.server.postMessage({ type: 'webview.refresh' })
    },
    openSettings() {
      api.server.postMessage({ type: 'open-builtin-settings' })
    },
    openSearch() {
      api.server.postMessage({ type: 'open-search' })
    },
  },
}
</script>

<style lang="stylus">
.nav-bar
  padding var(--i18n-ally-margin)
  display grid
  grid-template-columns auto max-content
</style>
