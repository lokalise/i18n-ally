import { commands, window } from 'vscode'
import { Commands, Global, TranslationCandidateWithMeta } from '../core'
import { ExtensionModule } from '../modules'
import i18n from '../i18n'

const m: ExtensionModule = (ctx) => {
  return [
    commands.registerCommand(Commands.review_apply_translation,
      async(candidate: TranslationCandidateWithMeta) => {
        const Apply = i18n.t('prompt.button_apply')
        const Discard = i18n.t('prompt.button_discard')
        const EditApply = i18n.t('prompt.button_edit_end_apply')

        const result = await window.showInformationMessage(
          i18n.t('prompt.applying_translation_candidate', candidate.keypath, candidate.text),
          { modal: true },
          Apply,
          EditApply,
          Discard,
        )

        if (result === EditApply)
          await Global.reviews.promptEditTranslation(candidate.keypath, candidate.locale)
        else if (result === Apply || result === EditApply)
          await Global.reviews.applyTranslationCandidate(candidate.keypath, candidate.locale)
        else if (result === Discard)
          await Global.reviews.discardTranslationCandidate(candidate.keypath, candidate.locale)
      }),
  ]
}

export default m
