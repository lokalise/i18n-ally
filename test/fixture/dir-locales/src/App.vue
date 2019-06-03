<template>
  <div id="app">
    <p>{{$t('project')}}</p>
    <p>{{$t('hello')}}</p>
    <p>{{$t('not_exists')}}</p>
  </div>
</template>

<script>
export default {
  name: 'app',

  mounted(){
    console.log(this.$t('nested.foo.bar'))
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
