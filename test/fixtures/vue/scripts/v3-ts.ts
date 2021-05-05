// https://github.com/antfu/icones/blob/master/src/components/IconDetail.vue

import copyText from 'copy-text-to-clipboard'
import { ref, computed, defineProps, defineEmit } from 'vue'
import { getIconSnippet, toComponentName } from '../utils/icons'
import { collections } from '../data'
import { selectingMode, previewColor, toggleBag, inBag } from '../store'
import { isVSCode } from '../env'
import { bufferToString } from '../utils/bufferToSring'
import { Download } from '../utils/pack'

const emit = defineEmit(['close'])
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  showCollection: {
    type: Boolean,
    required: true,
  },
})
const copied = ref(false)
const copy = async(type: string) => {
  const text = await getIconSnippet(props.icon, type, true)
  if (!text)
    return
  copied.value = copyText(text)
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
const download = async(type: string) => {
  const text = await getIconSnippet(props.icon, type, false)
  if (!text)
    return
  const name = `${toComponentName(props.icon)}.${type}`
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  Download(blob, name || 'Filename')
}
const toggleSelectingMode = () => {
  selectingMode.value = !selectingMode.value
  if (selectingMode.value)
    emit('close')
}
const collection = computed(() => {
  const id = props.icon.split(':')[0]
  return collections.find(i => i.id === id)
})
