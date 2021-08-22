import { commands, window } from 'vscode'
import { Commands } from './commands'
import { ExtensionModule } from '~/modules'
import { ReviewTranslationCandidates } from '~/views/items/ReviewTranslationCandidates'
import i18n from '~/i18n'
import { Global, TranslationCandidateWithMeta, ReviewCommentWithMeta, Telemetry, TelemetryKey } from '~/core'

export default <ExtensionModule> function() {
  return [
    commands.registerCommand(Commands.review_apply_translation,
      async(candidate: TranslationCandidateWithMeta | ReviewTranslationCandidates) => {
        Telemetry.track(TelemetryKey.ReviewApplyTranslation)

        if (candidate instanceof ReviewTranslationCandidates) {
          const candidates = candidate.candidates

          if (!candidates.length)
            return

          if (candidates.length === 1) {
            // fallback to single item mode
            candidate = candidates[0]
          }
          else {
            const Yes = i18n.t('prompt.button_yes')

            if (Yes === await window.showInformationMessage(
              i18n.t('prompt.applying_translation_candidate_multiple', candidates.length),
              { modal: true },
              Yes,
            ))
              await Global.reviews.applyTranslationCandidates(candidates)

            return
          }
        }
        // single item
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
        else if (result === Apply)
          await Global.reviews.applyTranslationCandidate(candidate.keypath, candidate.locale)
        else if (result === Discard)
          await Global.reviews.discardTranslationCandidate(candidate.keypath, candidate.locale)
      },
    ),

    commands.registerCommand(Commands.review_apply_suggestion,
      async(comment: ReviewCommentWithMeta) => {
        Telemetry.track(TelemetryKey.ReviewApplySuggestion)

        const Apply = i18n.t('prompt.button_apply')

        const result = await window.showInformationMessage(
          i18n.t('prompt.applying_suggestion', comment.keypath, comment.suggestion),
          { modal: true },
          Apply,
        )

        if (result === Apply)
          await Global.reviews.applySuggestion(comment.keypath, comment.locale, comment.id)
      },
    ),
  ]
}
