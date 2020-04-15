<template lang="pug">
.avatar
  .image
    img(:src='src')
</template>

<script lang="js">
/* eslint-disable vue/require-default-prop */
import Vue from 'vue'
import VCheck from 'vue-material-design-icons/Check.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'
import { getAvatarFromEmail } from '../../utils/shared'

export default Vue.extend({
  components: {
    VCheck,
    VPlusMinus,
  },

  props: {
    user: { type: Object, default: () => ({ name: '', email: '' }) },
  },

  computed: {
    src() {
      return getAvatarFromEmail(this.user.email)
    },
  },
})
</script>

<style lang="stylus">
.avatar
  position relative

  .image
    width 2em
    height 2em
    border-radius 50%
    overflow hidden
    background var(--vscode-foreground)
</style>
