<template lang="pug">
.record-editor
  .edit-input.panel(:class='{active}')
    flag(:locale='record.locale' size='18')
    textarea(
      ref='textarea1'
      placeholder='(empty)'
      rows='1'
      v-model='value'
      @focus='onFocus'
      @blur='onBlur'
      @input='onInput'
    )
    .buttons(v-if='active')
      .button(@click='reviewing=!reviewing')
        v-comment-edit-outline
        | Review
      .button(@click='translate')
        v-translate
        | Translate

  .review-panel(v-if='comments.length || reviewing')
    .comments
      template(v-for='c in comments')
        avatar(:user='c.user' :state='c.type')
        .panel.comment-content
          .text {{c.comment}} | {{c.suggestion}}

          .buttons
            .button
              v-checkbox-marked-outline
              | Resolve
            .button Accept Suggestion

      template(v-if='reviewing')
        avatar(:user='$store.state.config.user')
        .panel.comment-form
          label Comment
          .panel
            textarea(
              rows='1'
              ref='textarea2'
              placeholder='(Optional)'
              v-model='reviewForm.comment'
            )

          label Suggestion
          .panel
            textarea(
              rows='1'
              ref='textarea3'
              placeholder='(Optional)'
              v-model='reviewForm.suggestion'
            )

          .buttons
            .button(@click='postComment("accept")' :disabled='!!reviewForm.suggestion')
              v-check
              | Approve
            .button(@click='postComment("request_change")')
              v-plus-minus
              | Request Change
            .button(@click='postComment("comment")' :disabled='!reviewForm.suggestion && !reviewForm.comment')
              v-comment-outline
              | Leave Comment
            .button(@click='resetForm()') Cancel
</template>

<script lang="js">
import Vue from 'vue'
import VCheck from 'vue-material-design-icons/Check.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'
import VCommentOutline from 'vue-material-design-icons/CommentOutline.vue'
import VTranslate from 'vue-material-design-icons/Translate.vue'
import VCommentEditOutline from 'vue-material-design-icons/CommentEditOutline.vue'
import VCheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'
import Flag from './Flag.vue'
import Avatar from './Avatar.vue'
import { vscode } from './api'

export default Vue.extend({
  components: {
    Flag,
    Avatar,
    VCheck,
    VPlusMinus,
    VCommentOutline,
    VTranslate,
    VCommentEditOutline,
    VCheckboxMarkedOutline,
  },

  props: {
    record: { type: Object, default: () => ({ locale: '', value: '' }) },
    keypath: { type: String, default: '' },
    review: { type: Object, default: () => ({ comments: [] }) },
  },

  data() {
    return {
      reviewing: false,
      active: false,
      changed: false,
      value: '',
      reviewForm: {
        comment: '',
        suggestion: '',
      },
    }
  },

  computed: {
    comments() {
      return (this.review.comments || [])
        .filter(i => !i.resolved)
    },
  },

  watch: {
    record: {
      deep: true,
      immediate: true,
      handler() {
        if (this.active && this.changed)
          return

        this.reset()
      },
    },
    keypath() {
      this.reset()
      this.resetForm()
    },
    value() {
      this.$nextTick(() => this.resize(this.$refs.textarea1))
    },
    reviewForm: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.resize(this.$refs.textarea2)
          this.resize(this.$refs.textarea3)
        })
      },
    },
  },

  mounted() {
    this.$nextTick(() => this.resize(this.$refs.textarea1))
  },

  methods: {
    reset() {
      this.changed = false
      this.value = this.record.value
    },
    resetForm() {
      this.reviewing = false
      this.reviewForm = {
        comment: '',
        suggestion: '',
      }
    },
    resize(ta) {
      if (!ta)
        return

      ta.style.height = 'auto'
      ta.style.height = `${ta.scrollHeight - 3}px`
    },
    onInput() {
      if (this.value !== this.record.value)
        this.changed = true
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
    postComment(type) {
      vscode.postMessage({
        name: 'review.comment',
        keypath: this.record.keypath,
        locale: this.record.locale,
        data: {
          ...this.reviewForm,
          type,
        },
      })
      this.resetForm()
    },
  },
})
</script>

<style lang="stylus">
.panel
  padding 5px
  position relative

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

  label
    display block
    font-size 0.8em
    margin-top 4px
    margin-bottom 1px

  label:not(:first-child)
    margin-top 8px

.record-editor
  .edit-input
    display grid
    grid-template-columns max-content auto max-content
    margin-top 8px

  .review-panel
    padding-bottom 8px

  .comment-form
    padding 6px 12px
    margin-top 4px

    .buttons
      margin-top 4px

  .comment-content
    display grid
    grid-template-columns auto max-content
    margin-top 4px

    .text
      margin auto 4px

  .comments
    display grid
    grid-template-columns max-content auto

    .avatar
      margin 8px 4px 0 2px

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
</style>
