<template>
  <div id="app">
    <p title="Greating">
      Hello World
      Good
    </p>
    <p>Foo</p>
  </div>
</template>

<script>
export default {
  computed: {
    foobar() {
      return 'Good Morning!'
    },
  },
}
</script>
