<template lang="pug">
.key-editor
  .paginate
    .prev
    .key-name "{{data.keypath}}"
    .next

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
</style>
