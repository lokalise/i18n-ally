import { api } from '../api/index'

export default {
  computed: {
    sidebar: {
      get() {
        return this.$store.state.standalone
          ? false
          : this.$store.state.sidebar
      },
      set(value) {
        this.$store.commit('set', { key: 'sidebar', value })
      },
    },
    keyIndex: {
      get() {
        return this.$store.state.routeData.index
        ?? this.contextKeys.indexOf(this.$store.state.routeData.keypath)
      },
      set(value) {
        this.$store.commit('set', { key: 'routeData.index', value })
      },
    },
    contextKeys() {
      return this.$store.state.context.keys
    },
    mode() {
      return this.$store.state.mode
    },
    config() {
      return this.$store.state.config
    },
    context() {
      return this.$store.state.context
    },
    state() {
      return this.$store.state
    },
  },
  methods: {
    gotoKey(v) {
      if (api.mode === 'vscode') {
        api.server.postMessage({
          type: 'navigate-key',
          data: {
            filepath: this.context.filepath,
            keyIndex: v,
            ...this.contextKeys[v],
          },
        })
      }
      else {
        api.server.postMessage({
          type: 'edit-key',
          keypath: this.contextKeys[v].key,
        })
      }
    },
    nextKey(offset) {
      this.gotoKey(this.keyIndex + offset)
    },
  },
}
