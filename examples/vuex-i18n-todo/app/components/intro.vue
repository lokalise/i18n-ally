<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div :class="$style.intro" v-html="$t('intro.text')" />
</template>

<script>
export default {
  name: 'Intro',
}
</script>

<style lang="stylus" module>

  .intro {
    display: block;
    font-size: 64px;
    font-weight: 300;
    margin-bottom: 40px;
  }

  :global .highlight {
    padding: 0px 6px;
    background: #D3B63A;
  }

</style>
