<template>
  <div :class="$style.actions">
    <div v-if="anyTodos" :class="$style.indicator">
      {{ $t('todos.indicator', {count: activeTodos.length}, activeTodos.length) }}
    </div>

    <div v-if="anyTodos" :class="$style.switch">
      <router-link :to="{name:'todos', params: {status: 'all'}}">
        {{ $t('todos.all') }}
      </router-link>
      <router-link :to="{name:'todos', params: {status: 'active'}}">
        {{ $t('todos.active') }}
      </router-link>
      <router-link :to="{name:'todos', params: {status: 'completed'}}">
        {{ $t('todos.completed') }}
      </router-link>
    </div>

    <div :class="$style.localize">
      <localizer />
      <router-link :to="{name:'about'}">
        {{ $t('about.name') }}
      </router-link>
    </div>
  </div>
</template>

<script>

import Localizer from './localizer.vue'

export default {
  name: 'Actions',
  components: { Localizer },
  computed: {
    anyTodos () {
      return this.$store.state.todos.length > 0
    },
    activeTodos () {
      return this.$store.state.todos.filter((todo) => {
        return todo.status === 'active'
      })
    },
  },
}
</script>

<style lang="stylus" module>

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    opacity: 0.6;
    font-size: 14px;

    a {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    :global a.router-link-active {
      text-decoration: underline;
    }

    a + a {
      margin-left: 12px;
    }

    .indicator {
      flex-grow: 0;
      padding-left: 12px;
    }

    .localize {
      flex-grow: 0;
      display: flex;

      :last-child {
        margin-left: 12px;
      }
    }

    .switch {
      flex-grow: 1;
      display: flex;
      justify-content: center;
    }
  }
</style>
