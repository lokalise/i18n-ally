// https://github.com/breadsplit/breadsplit/blob/dev/packages/client/components/dialogs/FormCategory.vue
import { Component, Vue } from 'nuxt-property-decorator'
import PromiseDialog from '../global/PromiseDialog.vue'
import { Category } from '~/types'
import { CategoryDefault } from '~/core'

@Component
export default class FormCategory extends Vue {
  form: Category = CategoryDefault()
  mode: 'edit' | 'create' = 'create'
  $refs!: {
    dialog: PromiseDialog
  }
  get submitable() {
    return this.form.text && this.form.color && this.form.icon
  }
  async open(category?: Category) {
    if (category && category.id)
      this.mode = 'edit'
    else
      this.mode = 'create'
    this.form = CategoryDefault(category)
    return await this.$refs.dialog.open<Category | undefined>()
  }
  get title() {
    if (this.mode === 'create')
      return this.$t('ui.category_editing.create')
    else
      return this.$t('ui.category_editing.edit')
  }
}
