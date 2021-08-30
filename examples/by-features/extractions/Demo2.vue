<template>
  <div class="center">
    <h1>Test</h1>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';

@Options({
  components: {
  }
})
export default class NotImplement extends Vue {
  private test: Record<string, string> = {}; // if delete this line, it's ok, and must delete, commented-out is not work
  mounted() {
    const a = 'Hello World'
  }
}
</script>
