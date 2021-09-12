import { window, env, Uri } from 'vscode'
import { Telemetry, TelemetryKey } from '~/core'
import { Storage } from '~/core/Storage'

const INSTALLED_TIME = 1000 * 60 * 60 * 24 * 30 // 30 days
const SURVEY_URL = 'https://lokalise.com/'
const EVENTS_COUNT = 30
const ACCEPTED_EVENTS: TelemetryKey[] = [
  TelemetryKey.EditKey,
  TelemetryKey.ExtractString,
  TelemetryKey.ExtractStringBulk,
]

const STORAGE_KEY = 'timely.2021-survey'

export async function registerSurveyPrompt() {
  if (Date.now() - Storage.installDate < INSTALLED_TIME)
    return
  const prompted = Storage.get(STORAGE_KEY, () => false, false)
  if (prompted)
    return

  let eventsCount = 0
  Telemetry.onTrack(({ key }) => {
    if (ACCEPTED_EVENTS.includes(key))
      eventsCount += 1
    if (eventsCount >= EVENTS_COUNT && !prompted) {
      Storage.set(STORAGE_KEY, true)
      promptForSurvey()
    }
  })
}

export async function promptForSurvey() {
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
