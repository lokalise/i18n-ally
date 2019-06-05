export default {

  // add a new todo item
  addTodo (state, txt) {
    const todo = {
      id: state.todos.length + 1,
      text: txt,
      status: 'active',
    }

    state.todos.push(todo)
  },

  // remove the given todo tiem
  removeTodo (state, id) {
    const index = state.todos.findIndex((todo) => {
      return todo.id === id
    })

    if (index > -1) {
      // remove the item from the todo list
      state.todos.splice(index, 1)
    }
  },

  // mark the given todo item as done or not done
  toggleTodo (state, id) {
    const index = state.todos.findIndex((todo) => {
      return todo.id === id
    })

    if (index > -1) {
      switch (state.todos[index].status) {
        case 'active':
          state.todos[index].status = 'completed'
          break

        case 'completed':
          state.todos[index].status = 'active'
          break
      }
    }
  },
}
