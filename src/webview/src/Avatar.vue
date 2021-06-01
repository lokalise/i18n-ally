<template lang="pug">
.avatar
  .image
    img(:src='src')
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getAvatarFromEmail } from '../../utils/shared'

export default defineComponent({
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
