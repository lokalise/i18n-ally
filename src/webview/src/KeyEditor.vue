<template lang="pug">
.key-editor
  .paginate
    .prev
    .key-name "{{data.keypath}}"
    .next

  .reviews
    template(v-if='!data.reviews.description')
      .add-description(@click='editDescription') Add description...
    template(v-else)
      .description(@click='editDescription') {{data.reviews.description}}

  record-editor(
    v-for='r in records'
    :record='r'
    :key='r.locale'
  )
</template>

<script lang="js">
import Vue from 'vue'
import Flag from './Flag.vue'
import RecordEditor from './RecordEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    RecordEditor,
  },

  inheritAttrs: false,

  props: {
    data: { type: Object, default: () => ({ records: {} }) },
  },

  computed: {
    config() {
      return this.$store.state.config
    },
    records() {
      return (this.config.locales || [])
        .filter(i => !(this.config.ignoredLocales || []).includes(i))
        .map(l => this.data.records[l])
    },
  },

  methods: {
    editDescription() {
      vscode.postMessage({
        name: 'review',
        field: 'description',
        keypath: this.data.keypath,
      })
    },
  },
})
</script>

<style lang="stylus" scoped>
.key-editor
  .paginate
    padding 4px
    display grid
    grid-template-columns max-content auto max-content

    .key-name
      text-align center
      font-family var(--vscode-editor-font-family)

  .reviews
    text-align center

    .add-description
      opacity 0.5
      font-style italic
      padding 2px
      cursor pointer

    .description
      padding 2px
      cursor pointer

</style>
