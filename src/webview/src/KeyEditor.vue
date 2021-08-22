<template lang="pug">
.key-editor(
  :class='{"with-sidebar": sidebar}'
  @mousedown='onMousedown'
  @mouseup='dragging=false'
  @mousemove='onMove'
)
  .sidebar(:style='{width: sidebarWidth +"px"}' v-if='sidebar')
    .keys
      .item.panel(
        v-for='(key, idx) in contextKeys'
        @click='gotoKey(idx)'
        :class='{active: idx === keyIndex}'
      )
        .key {{key.key}}
        .value(:class='{empty: !key.value}') {{key.value || $t('editor.empty')}}

    .resize-handler
      .inner

  .content
    .header
      template(v-if='contextKeys.length')
        .buttons
          .button(@click='sidebar = !sidebar' v-if='contextKeys.length')
            v-menu
          .button(@click='nextKey(-1)' :disabled='keyIndex <= 0')
            v-chevron-left
          .button(@click='nextKey(1)' :disabled='keyIndex >= contextKeys.length - 1')
            v-chevron-right
        br

      .key-name
        span "{{data.keypath}}"
        v-pencil.setting-button.small(@click='renameKey')

      // pre {{$store.state.context}} {{keyIndex}}

      .reviews
        template(v-if='!data.reviews.description')
          .description.add(@click='editDescription') {{ $t('editor.add_description') }}
        template(v-else)
          .description(@click='editDescription') {{data.reviews.description}}

      .buttons.actions
        .button(@click='translateAll' v-if='emptyRecords.length')
          v-earth
          span {{ $t('editor.translate_all_missing') }} ({{emptyRecords.length}})
        // .button Mark all as...

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

  data() {
    return {
      dragging: false,
      sidebarWidth: 150,
      sidebar: false,
      current: '',
      keyIndex: 0,
    }
  },

  computed: {
    context() {
      return this.$store.state.context
    },
    contextKeys() {
      return this.context.keys || []
    },
    config() {
      return this.$store.state.config
    },
    records() {
      return (this.config.locales || [])
        .filter(i => !(this.config.ignoredLocales || []).includes(i))
        .map(l => this.data.records[l])
    },
    emptyRecords() {
      return this.records.filter(i =>
        !i.readonly
        && !i.value
        && !((this.data?.reviews?.locales || {})[i.locale]?.translation_candidate),
      )
    },
  },

  watch: {
    'data.locale': {
      immiediate: true,
      handler(v) {
        if (v)
          this.current = v || ''
      },
    },
    'context': {
      immiediate: true,
      handler() {
        this.keyIndex = this.data.keyIndex ?? this.contextKeys.indexOf(this.data.keypath) ?? 0
      },
    },
    keyIndex() {
      vscode.postMessage({
        type: 'navigate-key',
        data: {
          filepath: this.context.filepath,
          keyIndex: this.keyIndex,
          ...this.contextKeys[this.keyIndex],
        },
      })
    },
    contextKeys() {
      if (!this.contextKeys?.length)
        this.sidebar = false
    },
  },

  methods: {
    editDescription() {
      vscode.postMessage({
        type: 'review.description',
        keypath: this.data.keypath,
      })
    },
    renameKey() {
      vscode.postMessage({
        type: 'rename-key',
        keypath: this.data.keypath,
      })
    },
    translateAll() {
      vscode.postMessage({
        type: 'translate',
        data: {
          keypath: this.data.keypath,
          locales: this.emptyRecords.map(i => i.locale),
        },
      })
    },
    gotoKey(v) {
      this.keyIndex = v
    },
    nextKey(offset) {
      this.gotoKey(this.keyIndex + offset)
    },
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

<style lang="stylus" scoped>
.key-editor
  display grid
  &.with-sidebar
    grid-template-columns max-content auto

  .sidebar
    overflow-y auto
    overflow-x hidden
    position relative
    padding 0.8em

    .resize-handler
      position absolute
      top 0
      right -6px
      bottom 0
      padding 0 6px
      cursor ew-resize

      .inner
        height 100%
        width 1px
        background var(--vscode-foreground)
        pointer-events none
        opacity 0
        transition .2s ease-in-out

      &:hover .inner
        opacity 0.5

    .keys
      display grid
      grid-template-rows auto
      grid-gap 0.4em
      overflow-x auto

      .item
        font-size 0.8em
        opacity 0.5
        cursor pointer

        &::before
          opacity 0.08

        &.active
          opacity 1
          cursor default

        &.active::before
          opacity 0.1

        &::after
          opacity 0 !important

        .key
          font-family var(--vscode-editor-font-family)

        .value
          &.empty
            opacity 0.5

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
