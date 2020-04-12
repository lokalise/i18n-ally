<template lang="pug">
.record-editor(:class='{active}')
  flag(:locale='record.locale' size='18')
  textarea(
    ref='textarea'
    placeholder='(empty)'
    rows='1'
    v-model='value'
    @focus='onFocus'
    @blur='onBlur'
    @input='onInput'
  )
  .buttons(v-if='active')
    .icon-button(@click='translate') Translate
</template>

<script lang="js">
import Vue from 'vue'
import Flag from './Flag.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
  },

  props: {
    record: { type: Object, default: () => ({ locale: '', value: '' }) },
  },

  data() {
    return {
      active: false,
      changed: false,
      value: '',
    }
  },

  watch: {
    record: {
      deep: true,
      immediate: true,
      handler() {
        if (this.active && this.changed)
          return

        this.changed = false
        this.value = this.record.value
        this.$nextTick(() => this.resize())
      },
    },
  },

  mounted() {
    this.$nextTick(() => this.resize())
  },

  methods: {
    resize() {
      const ta = this.$refs.textarea
      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight - 3}px`
    },
    onInput() {
      if (this.value !== this.record.value)
        this.changed = true

      this.resize()
    },
    onFocus() {
      this.value = this.record.value
      this.active = true
    },
    onBlur(e) {
      console.log(e)
      if (!e.relatedTarget) {
        e.preventDefault()
        e.srcElement.focus()
      }
      else {
        this.active = false
      }

      if (this.value !== this.record.value) {
        vscode.postMessage({
          name: 'edit',
          data: {
            keypath: this.record.keypath,
            locale: this.record.locale,
            value: this.value,
          },
        })
      }
    },
    translate() {
      vscode.postMessage({
        name: 'translate',
        data: {
          keypath: this.record.keypath,
          locale: this.record.locale,
        },
      })
    },
  },
})
</script>

<style lang="stylus">
.record-editor
  padding 5px
  margin 5px 0
  position relative
  display grid
  grid-template-columns max-content auto max-content

  &::before, &::after
    content ""
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    border-radius 3px
    z-index -1
    pointer-events none

  &::before
    background var(--vscode-foreground)
    opacity 0.07

  &::after
    border 1px solid transparent

  &.active::after
    border-color var(--vscode-foreground)
    opacity 0.7

  & > *
    vertical-align middle

  .flag-icon
    width 30px
    height 25px
    padding 2px 0

  textarea
    margin auto
    background transparent
    border none
    color var(--vscode-forground)
    width calc(100% - 10px)
    resize none
    overflow-y hidden

  input:focus,
  select:focus,
  textarea:focus,
  button:focus
    outline none

.icon-button
  cursor pointer
  position relative
  padding 4px
  font-size 0.8em
  margin 4px

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
    opacity 0.07
</style>
