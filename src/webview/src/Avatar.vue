<template lang="pug">
.avatar
  img(:src='src')
</template>

<script lang="js">
/* eslint-disable vue/require-default-prop */
import Vue from 'vue'
import md5 from 'blueimp-md5'

export default Vue.extend({
  props: {
    user: { type: Object, default: () => ({ name: '', email: '' }) },
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
  width 30px
  height 30px
  border-radius 50%
  overflow hidden
</style>
