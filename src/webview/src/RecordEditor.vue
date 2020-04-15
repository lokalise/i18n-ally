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
      .button(@click='reviewing=!reviewing' v-if='$store.state.config.review')
        v-comment-edit-outline
        | Review
      .button(@click='translate')
        v-translate
        | Translate

    .review-brief(v-if='$store.state.config.review')
      v-check.state-icon(v-if='reviewBrief==="approve"')
      v-plus-minus.state-icon(v-else-if='reviewBrief==="request_change"')
      v-comment-question-outline.state-icon(v-else-if='reviewBrief==="conflict"')
      v-comment-outline.state-icon(v-else-if='reviewBrief==="comment"')

  .review-panel(v-if='$store.state.config.review && ((comments.length && active) || reviewing)')
    .comments
      template(v-for='c in comments')
        avatar(:user='c.user')
        .panel.shadow.comment-content
          template
            v-check.state-icon(v-if='c.type==="approve"')
            v-plus-minus.state-icon(v-else-if='c.type==="request_change"')
            v-comment-outline.state-icon(v-else)

          .text(:class='{placeholder: !c.comment}') {{c.comment || (c.type === "approve" ? "Approved" : "Change requested")}}

          .buttons
            .button.flat(v-if='c.suggestion') Accept Suggestion
            .button.approve.flat(@click='resolveComment(c)')
              v-checkbox-marked-outline
              | Resolve

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
            .button.approve(@click='postComment("approve")' :disabled='!!reviewForm.suggestion')
              v-check
              | Approve
            .button.request-change(@click='postComment("request_change")')
              v-plus-minus
              | Request Change
            .button.comment(@click='postComment("comment")' :disabled='!reviewForm.suggestion && !reviewForm.comment')
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
import VCommentQuestionOutline from 'vue-material-design-icons/CommentQuestionOutline.vue'
import VCheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'
import { getCommentState } from '../../utils/shared'
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
    VCommentQuestionOutline,
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
      return (this.review?.comments || [])
        .filter(i => !i.resolved)
    },
    reviewBrief() {
      return getCommentState(this.comments)
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
      this.$refs.textarea1.focus()
    },
    resolveComment(comment) {
      vscode.postMessage({
        name: 'review.resolve',
        keypath: this.record.keypath,
        locale: this.record.locale,
        comment: comment.id,
      })
    },
  },
})
</script>

<style lang="stylus">
.panel
  padding 0.4em
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

  &.shadow
    &::before
      background var(--vscode-foreground)
      opacity 0.04

  label
    display block
    font-size 0.8em
    margin-top 0.4em
    margin-bottom 0.1em

  label:not(:first-child)
    margin-top 0.8em

.record-editor
  .edit-input
    display grid
    grid-template-columns max-content auto max-content max-content
    margin-top 8px

    .buttons
      margin auto

  .review-panel
    padding-bottom 8px

  .comment-form
    padding 6px 12px
    margin-top 0.3em

    .buttons
      margin-top 0.3em

  .state-icon
    padding-left 0.2em
    font-size 1.1em
    margin-top -0.1em

    &.plus-minus-icon
      color var(--review-request-change)

    &.check-icon
      color var(--review-approve)

    &.comment-question-outline-icon
      color var(--review-comment)

    &.comment-outline-icon
      opacity 0.3

  .review-brief
    .state-icon
      font-size 1.4em
      padding 0.1em
      margin auto 0.2em

  .comment-content
    display grid
    grid-template-columns min-content auto max-content max-content
    margin-top 0.4em

    .text
      margin auto 6px
      font-size 0.8em

      &.placeholder
        font-style italic
        opacity 0.4

    .buttons
      .button
        margin-top 0
        margin-bottom 0

  .comments
    display grid
    grid-template-columns max-content auto

    .avatar
      margin 0.6em 0.4em 0 1.2em

  & > *
    vertical-align middle

  .flag-icon
    width 2em
    height 1.8em
    padding 0.2em 0

  textarea
    margin auto
    background transparent
    border none
    color var(--vscode-forground)
    width calc(100% - 10px)
    resize none
    overflow-y hidden
    font-size 0.8em

  input:focus,
  select:focus,
  textarea:focus,
  button:focus
    outline none
</style>
