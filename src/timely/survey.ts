import { window } from 'vscode'
import { Storage } from '~/core/Storage'

let promptedThisTime = false

export async function promptForSurvey() {
  if (promptedThisTime)
    return
  let prompted = Storage.get('timely.2021-survey', () => false, false)
  if (prompted)
    return

  prompted = true
  promptedThisTime = true

  Storage.set('timely.2021-survey', true)

  const Take = 'Provide Feedback'
  const RemindLater = 'Remind me later'
  const Dismiss = 'Dismiss'
  const result = await window.showInformationMessage(
    'Enjoy using i18n Ally?\nWe\'d like to hear your voice and make it better!',
    Take,
    RemindLater,
    Dismiss,
  )

  if (result === Take) {
    // TODO
  }
  else if (result === RemindLater) {
    Storage.delete('timely.2021-survey')
  }
}
