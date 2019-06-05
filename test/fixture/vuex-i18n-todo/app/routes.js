import Todos from 'components/todos.vue'
import About from 'components/about.vue'

const routes = [
  {
    path: '/todo/:status?',
    name: 'todos',
    component: Todos,
    props: true,
    alias: ['/'],
  }, {
    path: '/about',
    name: 'about',
    component: About,
  },
]

export default routes
