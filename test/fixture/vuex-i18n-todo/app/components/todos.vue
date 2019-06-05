<template>
  <div>
    <input v-model="todo" @keydown.enter="addTodo"
      :class="$style.input"
      :placeholder="$t('todos.placeholder')" />

    <ul :class="$style.list">
      <li v-for="todo in todos" :key="todo.id"
        @click="toggleTodo(todo.id)"
        :class="[$style.todo, {[$style.done]: todo.status === 'completed'}]">

        <icon :class="$style.icon"
          :done="todo.status === 'completed'" />

        <span :class="$style.text">
          {{todo.text}}</span>
      </li>
    </ul>

    <actions />
  </div>
</template>

<script>

  import Icon from './todo-icon.vue';
  import Actions from './actions.vue';

  export default {
    name: 'Todos',
    components: { Icon, Actions },
    props: {
      status: {
        type: String,
        default: 'all'
      }
    },
    data() {
      return {
        todo: ''
      };
    },
    computed: {

      todos() {
        if (this.status === 'all') {
          return this.$store.state.todos;
        }

        // filter the todos
        return this.$store.state.todos.filter((todo) => {
          return todo.status === this.status;
        });
      }
    },
    methods: {

      addTodo(event) {
        this.$store.dispatch('addTodo', this.todo);
        this.todo = '';
      },

      toggleTodo(id) {
        this.$store.dispatch('toggleTodo', id);
      }
    }
  };
</script>


<style lang="stylus" module>
  @require("./todos");
</style>
