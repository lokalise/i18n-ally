export default {

  // add a new todo item
  addTodo ({ commit }, txt) {
    commit('addTodo', txt)
  },

  // remove the given todo tiem
  removeTodo ({ commit }, id) {
    commit('removeTodo', id)
  },

  // mark the given todo item as done or not done
  toggleTodo ({ commit }, id) {
    commit('toggleTodo', id)
  },
}
