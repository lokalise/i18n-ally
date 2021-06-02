import { CustomRefactorTemplate } from '~/core/types'

export function resolveRefactorTemplate(arr: (string | CustomRefactorTemplate & {template?: string})[] = []): CustomRefactorTemplate[] {
  return arr.map((i) => {
    if (typeof i === 'string') {
      return {
        templates: [i],
      }
    }
    const templates = i.templates || []
    if (i.template && typeof i.template === 'string')
      templates.push(i.template)

    return {
      ...i,
      templates,
    }
  })
}
