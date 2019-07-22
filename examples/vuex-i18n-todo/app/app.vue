<template>
  <div :class="$style.app">
    <intro />
    <router-view :class="$style.content" />
  </div>
</template>

<script>
import Intro from 'components/intro.vue'
export default {
  name: 'App',
  components: { Intro },
}
</script>
