<script>
export default {
  props: {
    path: { type: String, default: '' },
    tag: { type: String, default: 'span' },
    args: { type: Array, default: () => [] },
  },
  render(h) {
    return h(this.tag, {
      attrs: {
        'data-i18n-ally-key': this.path,
      },
    }, this.$t(this.path, this.args))
  },
}
</script>
