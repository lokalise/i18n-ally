import { window, env, Uri } from 'vscode'
import { Storage } from '~/core/Storage'

let promptedThisTime = false
const STORAGE_KEY = 'timely.2021-survey'
const SURVEY_URL = 'https://lokalise.com/'

export async function promptForSurvey() {
  if (promptedThisTime)
    return
  let prompted = Storage.get(STORAGE_KEY, () => false, false)
  if (prompted)
    return

  prompted = true
  promptedThisTime = true

  Storage.set(STORAGE_KEY, true)

  // TODO: i18n
  const Take = 'Provide Feedback'
  const Dismiss = 'Dismiss'
  const result = await window.showInformationMessage(
    'Enjoy using i18n Ally?\nWe\'d like to hear your voice and make it better!',
    Take,
    Dismiss,
  )

  if (result === Take)
    await env.openExternal(Uri.parse(SURVEY_URL))
}
