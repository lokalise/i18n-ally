<template>
  <p>{{ customT('project') }}</p>
</template>

<script>
export default {
  computed: {
    foobar() {
      return customT('nested.foo.bar')
    },
  },
}
</script>
