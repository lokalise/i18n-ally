<template>
  <div :class="$style.localizer">
    <span
      v-for="locale in $i18n.locales()"
      :key="'i81n-' + locale"
      @click="$i18n.set(locale)"
    >
      {{ locale }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'Localizer',
}
</script>

<style lang="stylus" module>
  .localizer {
    cursor: pointer;
    text-transform: uppercase;

    span + span {
      margin-left: 4px;
    }
  }
</style>
