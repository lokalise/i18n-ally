<template>
  <div :class="$style.about">
    <p>{{ $t('about.text') }}</p>
    <p :class="$style.back">
      <router-link :to="{name:'todos'}">
        {{ $t('about.link') }}
      </router-link>
    </p>
  </div>
</template>

<script>
export default {
  name: 'About',
}
</script>

<style lang="stylus" module>

  .about {
    font-size: 24px;

    p {
      margin-bottom: 1.5em;
    }
  }

  .back {

    a {
      text-decoration: underline;
      color: #4D94E7;
    }
  }
</style>
