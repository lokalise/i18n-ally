<template lang="pug">
.avatar
  .image
    img(:src='src')
  v-check.state(v-if='state==="approve"')
  v-plus-minus.state(v-if='state==="request_change"')
</template>

<script lang="js">
/* eslint-disable vue/require-default-prop */
import Vue from 'vue'
import md5 from 'blueimp-md5'
import VCheck from 'vue-material-design-icons/Check.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'

export default Vue.extend({
  components: {
    VCheck,
    VPlusMinus,
  },

  props: {
    user: { type: Object, default: () => ({ name: '', email: '' }) },
    state: { type: String, default: '' },
  },

  computed: {
    src() {
      return `https://www.gravatar.com/avatar/${md5(this.user.email)}`
    },
  },
})
</script>

<style lang="stylus">
.avatar
  position relative

  .image
    width 25px
    height 25px
    border-radius 50%
    overflow hidden
    background var(--vscode-foreground)

  .state
    position absolute
    right -1px
    top 14px
    height 12px
    width 12px
    border-radius 50%
    color white
    font-size 0.8em

    & > svg
      margin 1px 1px 2px 1px

    &.plus-minus-icon
      background var(--review-request-change)

    &.check-icon
      background var(--review-approve)
</style>
