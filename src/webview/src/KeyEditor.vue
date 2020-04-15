<template lang="pug">
.key-editor
  .paginate
    .prev
    .key-name "{{data.keypath}}"
    .next

  .reviews
    template(v-if='!data.reviews.description')
      .description.add(@click='editDescription') Add description...
    template(v-else)
      .description(@click='editDescription') {{data.reviews.description}}

  .buttons
    .button(@click='translateAll' v-if='emptyRecords.length')
      v-translate
      span Translate All Missing ({{emptyRecords.length}})
    .button Mark all as...

  record-editor(
    v-for='r in records'
    :keypath='data.keypath'
    :record='r'
    :review='(data.reviews.locales || {})[r.locale]'
    :key='r.locale'
  )
</template>

<script lang="js">
import Vue from 'vue'
import VTranslate from 'vue-material-design-icons/Translate.vue'
import Flag from './Flag.vue'
import RecordEditor from './RecordEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    RecordEditor,
    VTranslate,
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
    emptyRecords() {
      return this.records.filter(i => !i.readonly && !i.value)
    },
  },

  methods: {
    editDescription() {
      vscode.postMessage({
        name: 'review.description',
        keypath: this.data.keypath,
      })
    },
    translateAll() {
      vscode.postMessage({
        name: 'translate',
        data: {
          keypath: this.data.keypath,
          locales: this.emptyRecords.map(i => i.locale),
        },
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
      opacity 0.8

  .reviews
    text-align center
    padding-bottom 5px

    .description
      cursor pointer
      min-width 100px
      display inline-block
      position relative
      padding 4px 10px

      &:hover::after
        content ""
        background var(--vscode-foreground)
        opacity 0.1
        top 0
        left 0
        right 0
        bottom 0
        position absolute
        border-radius 4px

      &.add
        opacity 0.5
        font-style italic

</style>
