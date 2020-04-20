<template lang="pug">
.record-editor(:class='{active}')
  .edit-input.panel(:class='{"top-stacked": active && review.translation_candidate }')
    flag(:locale='record.locale' size='18')
    textarea(
      ref='textarea1'
      placeholder='(empty)'
      rows='1'
      :readonly='readonly'
      v-model='value'
      @focus='onFocus'
      @blur='onBlur'
      @input='onInput'
    )

    .buttons(v-if='active')
      .button(v-if='readonly' disabled)
        v-pencil-off

      .button(@click='translate' v-if='!readonly && !review.translation_candidate && record.locale !== $store.state.config.sourceLanguage')
        v-earth
        span {{ $t('editor.translate') }}

      .button(@click='reviewing=!reviewing' v-if='$store.state.config.review')
        v-comment-edit-outline
        span {{ $t('review.review') }}

    .review-brief(v-if='$store.state.config.review')
      v-check.state-icon(v-if='reviewBrief==="approve"')
      v-plus-minus.state-icon(v-else-if='reviewBrief==="request_change"')
      v-comment-question-outline.state-icon(v-else-if='reviewBrief==="conflict"')
      v-comment-outline.state-icon(v-else-if='reviewBrief==="comment"')

  .translation-candidate.panel.shadow.bottom-stacked(v-if='active && review.translation_candidate')
    v-earth
    .text {{review.translation_candidate.text}}
    .buttons
      .button.flat(@click='transDiscard()') {{$t('prompt.button_discard')}}
      .button(@click='transEdit()')
        v-pencil
        span {{$t('prompt.button_edit_end_apply')}}
      .button(@click='transApply()')
        v-check-all
        span {{$t('prompt.button_apply')}}

  .review-panel(v-if='$store.state.config.review && ((comments.length && active) || reviewing)')
    .comments
      template(v-for='c in comments')
        avatar(:user='c.user')
        .panel.shadow.comment-content
          template
            v-check.state-icon(v-if='c.type==="approve"')
            v-plus-minus.state-icon(v-else-if='c.type==="request_change"')
            v-comment-outline.state-icon(v-else)

          .text(:class='{placeholder: !c.comment}') {{c.comment || placeholders[c.type]}}

          .buttons
            .button.approve.flat(@click='resolveComment(c)')
              v-checkbox-marked-outline
              span {{ $t('review.resolve') }}

        template(v-if='!readonly && c.suggestion')
          div
          .panel.shadow.comment-content
            v-format-quote-open.state-icon
            .text {{c.suggestion}}
            .buttons
              .button.flat(@click='acceptSuggestion(c)') {{$t('review.accept_suggestion')}}

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

          template(v-if='!readonly')
            label {{$t('review.suggestion')}}
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
              span {{$t('review.approve')}}
            .button.request-change(@click='postComment("request_change")')
              v-plus-minus
              span {{$t('review.request_change')}}
            .button.comment(@click='postComment("comment")' :disabled='!reviewForm.comment')
              v-comment-outline
              span {{$t('review.leave_comment')}}
            .button(@click='resetForm()') {{ $t('prompt.button_cancel') }}
</template>

<script lang="js">
import Vue from 'vue'
import VCheck from 'vue-material-design-icons/Check.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'
import VCommentOutline from 'vue-material-design-icons/CommentOutline.vue'
import VEarth from 'vue-material-design-icons/Earth.vue'
// import VEarthPlus from 'vue-material-design-icons/EarthPlus.vue'
import VCommentEditOutline from 'vue-material-design-icons/CommentEditOutline.vue'
import VCommentQuestionOutline from 'vue-material-design-icons/CommentQuestionOutline.vue'
import VCheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'
import VPencilOff from 'vue-material-design-icons/PencilOff.vue'
import VPencil from 'vue-material-design-icons/Pencil.vue'
import VCheckAll from 'vue-material-design-icons/CheckAll.vue'
import VDeleteEmptyOutline from 'vue-material-design-icons/DeleteEmptyOutline.vue'
import VFormatQuoteOpen from 'vue-material-design-icons/FormatQuoteOpen.vue'
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
    VEarth,
    // VEarthPlus,
    VCommentEditOutline,
    VCheckboxMarkedOutline,
    VCommentQuestionOutline,
    VDeleteEmptyOutline,
    VPencilOff,
    VPencil,
    VCheckAll,
    VFormatQuoteOpen,
  },

  props: {
    record: { type: Object, default: () => ({ locale: '', value: '' }) },
    keypath: { type: String, default: '' },
    review: { type: Object, default: () => ({ comments: [] }) },
    active: { type: Boolean, default: false },
  },

  data() {
    return {
      focused: false,
      reviewing: false,
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
    readonly() {
      return this.record.readonly
    },
    placeholders() {
      return {
        approve: this.$t('review.placeholder.approve'),
        request_change: this.$t('review.placeholder.request_change'),
        comment: this.$t('review.placeholder.comment'),
      }
    },
    changed() {
      return this.value !== this.record.value
    },
  },

  watch: {
    record: {
      deep: true,
      immediate: true,
      handler() {
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
    active(value) {
      if (!value && this.changed)
        this.save()
    },
  },

  mounted() {
    this.$nextTick(() => this.resize(this.$refs.textarea1))
  },

  methods: {
    reset() {
      if (this.focused && this.changed)
        return
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
      this.focused = true
      this.value = this.record.value
      this.$emit('update:active', true)
    },
    onBlur() {
      this.focused = false
      if (this.changed)
        this.save()
    },
    save() {
      vscode.postMessage({
        name: 'edit',
        data: {
          keypath: this.record.keypath,
          locale: this.record.locale,
          value: this.value,
        },
      })
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
    acceptSuggestion(comment) {
      vscode.postMessage({
        name: 'review.apply-suggestion',
        keypath: this.record.keypath,
        locale: this.record.locale,
        comment: comment.id,
      })
    },
    transDiscard() {
      vscode.postMessage({
        name: 'translation.discard',
        keypath: this.record.keypath,
        locale: this.record.locale,
      })
    },
    transApply() {
      vscode.postMessage({
        name: 'translation.apply',
        keypath: this.record.keypath,
        locale: this.record.locale,
      })
    },
    transEdit() {
      vscode.postMessage({
        name: 'translation.edit',
        keypath: this.record.keypath,
        locale: this.record.locale,
      })
    },
  },
})
</script>

<style lang="stylus">
.panel
  padding 0.4em
  position relative
  display grid

  &::before, &::after
    content ""
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    border-radius 4px
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

  &.top-stacked
    &::before, &::after
      border-bottom-right-radius 0
      border-bottom-left-radius 0

  &.bottom-stacked
    &::before, &::after
      border-top-right-radius 0
      border-top-left-radius 0

  label
    display block
    font-size 0.8em
    margin-left 0.1em
    margin-top 0.3em
    margin-bottom 0.3em
    opacity 0.8

  label:not(:first-child)
    margin-top 0.8em

.record-editor
  border-left 2px solid transparent
  padding-right var(--i18n-ally-margin)
  padding-left calc(var(--i18n-ally-margin) - 2px)

  &.active
    border-left 2px solid var(--vscode-foreground)

  .edit-input
    display grid
    grid-template-columns max-content auto max-content max-content
    margin-top 8px

    .flag-icon
      width 2em
      height 1.8em
      padding 0.2em 0.2em 0.2em 0

    .buttons
      margin auto

  .review-panel
    padding-bottom 8px

  .comment-form
    padding 6px 12px
    margin-top 0.3em

    .buttons
      margin-top 0.7em
      margin-bottom 0.3em

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

    &.format-quote-open-icon
      opacity 0.6

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

  textarea
    margin auto
    background transparent
    border none
    color var(--vscode-forground)
    width 100%
    resize none
    overflow-y hidden
    font-size 0.8em

  input:focus,
  select:focus,
  textarea:focus,
  button:focus
    outline none

.translation-candidate.panel
  display grid
  grid-template-columns max-content auto max-content

  .earth-icon
    margin auto 0.5em auto 0.7em
    font-size 1.2em
    height 0.8em
    opacity 0.6

  .text
    margin auto 0.4em
    font-size 0.8em
    font-style italic
</style>
