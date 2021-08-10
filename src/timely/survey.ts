import { window } from 'vscode'

let prompted = false

export async function promptForSurvey() {
  if (prompted)
    return

  prompted = true

  const result = await window.showInformationMessage(
    'Enjoy using i18n Ally?\nWe\'d like to hear your voice and make it better!',
    'Provide Feedback',
    'Remind me later',
    'Dismiss',
  )

  // TODO:
  console.log(result)
}
