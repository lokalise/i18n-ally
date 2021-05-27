<!-- Ported from https://raw.githubusercontent.com/pepf/retrospectify/master/src/components/SavedBoards.vue -->

<template>
  <div class="sidebar-component">
    <transition name="slide">
      <div v-show="expanded" class="sidebar">
        <p class="sidebar-menu">
          <button class="invert" title="Save board for later editing" @click="saveBoards">
            Save
          </button>
          <button class="invert" title="Export board contents to file" @click="exportBoard(activeBoardIndex)">
            Export
          </button>
          <button class="invert small" @click="clearBoard">
            Clear the board
          </button>
        </p>
        <h2>Saved boards</h2>
        <ul>
          <li
            v-for="(board, index) in boards"
            :key="index"
            :class="{ 'active' : (activeBoardIndex == index)}"
            @click="loadBoard(index)"
          >
            {{ board.title }}
            <span v-show="boards.length > 1" class="remove-board" title="remove" @click="removeBoard(index)">✕</span>
          </li>
        </ul>
        <button @click="createBoard">
          + New
        </button>
        <div
          class="about"
          :placeholder="`Version ${version}`"
          :title="'Version' + version"
        >
          Retrospectify V{{ version }}
        </div>
      </div>
    </transition>
    <div v-show="expanded" class="sidebar-overlay" @click="toggle" />
  </div>
</template>

<script>
import bus from '../bus.js'

export default {
  name: 'SavedBoards',
  props: ['boards', 'activeBoardIndex'],

  data() {
    return {
      expanded: false,
      version: VERSION,
    }
  },

  created() {
    const self = this
    bus.$on('toggle-sidebar', () => {
      self.toggle()
    })
  },
  methods: {
    loadBoard(id) {
      console.log('This should also be hard strings')
      bus.$emit('load-board', id)
    },
    createBoard() {
      bus.$emit('create-board')
    },
    removeBoard(id) {
      bus.$emit('remove-board', id)
    },
    clearBoard() {
      bus.$emit('clear-board')
    },
    saveBoards() {
      bus.$emit('save-boards')
    },
    exportBoard(id) {
      bus.$emit('export-board', id)
    },
    toggle() {
      this.expanded = !this.expanded
    },
  },
}
</script>

<style lang="scss" scoped>
@import './src/assets/styles/variables.scss';

/* sidebar component styles */
$sidebar-bg: $denim;

.sidebar {
    top: 0;
    bottom: 0;
    position: absolute;
    width: 300px;
    background-color: $sidebar-bg;
    color: $white;
    right: 0;
    padding: 1em;
    z-index: 2000;

  .sidebar-menu {
    clear:both;
    display:block;
    height: 2em;
  }
  .sidebar-menu > * {
    float:right;
  }

  ul {
      list-style: none;
      padding: 0;
  }
  li {
    cursor: pointer;
    padding: 1em;

  }
  li:hover {
    background-color: darken($sidebar-bg, 5%);
  }
  li.active {
    background-color: lighten($sidebar-bg, 5%);
  }

  .remove-board {
    float: right;
    opacity: 0.75;
    cursor: pointer;
  }
  .remove-board:hover {
    opacity: 1.0;
  }

  .about {
    position: absolute;
    bottom: 0;
    font-size: 0.6em;
    padding: 1em;
    right: 0;
  }
}

.sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition: right 0.25s  cubic-bezier(0.215, 0.610, 0.355, 1.000); //ease out cubic
}
.slide-enter, .slide-leave-to {
  right: -300px;
}
</style>
