<template>
  <div id="app">
    <p title="Greating">
      Hello World
      Good
    </p>
    <p>Foo</p>
    <p>Demo</p>
    <p>Hello</p>
  </div>
</template>

<script>
export default {
  computed: {
    foobar() {
      return '<>Good Morning!'
    },
  },
}
</script>
