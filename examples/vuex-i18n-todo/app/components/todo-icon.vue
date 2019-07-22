<template>
  <div :class="$style.icon" @click="$emit('click', $event)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
      <circle cy="12.5" cx="12.5" r="8" stroke-width="2" :class="$style.outline" />
      <circle v-if="done" cy="12.5" cx="12.5" r="5" :class="$style.fill" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    done: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="stylus" module>
  .icon {
    svg {
      width: 100%;
      height: 100%;

      path {
        fill: #404040;
      }

      .outline {
        fill: transparent;
        stroke: #404040;
      }

      .fill {
        fill: #404040;
      }
    }
  }
</style>
