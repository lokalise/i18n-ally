<template>
  <div id="app">
    <p>{{$t('project')}}
    <p>{{$t('hello')}}
    <p>{{$t('not_exists')}}
  </div>
</template>

<script>
export default {
  name: 'app',

  mounted(){
    console.log(this.$t('nested.foo.bar'))
    console.log(this.$t('nested.test'))
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
