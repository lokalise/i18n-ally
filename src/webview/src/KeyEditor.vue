<template lang="pug">
.key-editor
  .header
    .key-name "{{data.keypath}}"

    .reviews
      template(v-if='!data.reviews.description')
        .description.add(@click='editDescription') {{ $t('editor.add_description') }}
      template(v-else)
        .description(@click='editDescription') {{data.reviews.description}}

    .buttons.actions
      .button(@click='translateAll' v-if='emptyRecords.length')
        v-earth
        span {{ $t('editor.translate_all_missing') }} ({{emptyRecords.length}})
      .button Mark all as...

  .records
    record-editor(
      v-for='r in records'
      :keypath='data.keypath'
      :record='r'
      :review='(data.reviews.locales || {})[r.locale]'
      :key='r.locale'
      :active='current === r.locale'
      @update:active='current = r.locale'
    )
</template>

<script lang="js">
import Vue from 'vue'
import VEarth from 'vue-material-design-icons/Earth.vue'
import Flag from './Flag.vue'
import RecordEditor from './RecordEditor.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    RecordEditor,
    VEarth,
  },

  inheritAttrs: false,

  props: {
    data: { type: Object, default: () => ({ records: {} }) },
  },

  data() {
    return {
      current: '',
    }
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

  watch: {
    data: {
      immiediate: true,
      handler() {
        if (this.data?.options?.locale)
          this.current = this.data.options.locale || ''
      },
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
  .header
    padding var(--i18n-ally-margin)

  .key-name
    font-family var(--vscode-editor-font-family)
    opacity 0.8

  .reviews
    padding-bottom 0.5em

    .description
      cursor pointer
      min-width 100px
      display inline-block
      position relative
      padding 0.4em

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
