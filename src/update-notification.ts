import { ExtensionContext, window, Uri, env } from 'vscode'
import semver from 'semver'
import { version } from '../package.json'
// import i18n from './i18n'

interface Notification {
  id: string
  condition: string
  message: string
  buttons: {
    text: string
    url: string
  }[]
}

export function checkNotification(ctx: ExtensionContext) {
  const notifications: Notification[] = [
    // {
    //   id: 'v2-update',
    //   condition: '<2.0.0',
    //   message: i18n.t('notification.v2-update'),
    //   buttons: [{
    //     text: i18n.t('notification.migrate'),
    //     url: 'https://github.com/lokalise/i18n-ally/wiki/Migration-v1.x',
    //   }],
    // },
  ]

  const previousVersion = ctx.globalState.get<string>('version') || '0.0.0'
  const notificationIds = (ctx.globalState.get<string>('notifications-ids') || '').split(',')

  for (const notification of notifications) {
    if (notificationIds.includes(notification.id))
      continue

    if (semver.satisfies(previousVersion, notification.condition)) {
      notificationIds.push(notification.id)
      const buttonNames = notification.buttons.map(b => b.text)
      window.showInformationMessage(notification.message, ...buttonNames)
        .then((result) => {
          const button = notification.buttons.find(i => i.text === result)
          if (button)
            env.openExternal(Uri.parse(button.url))
        })
    }
  }

  ctx.globalState.update('notifications-ids', notificationIds.join(','))
  ctx.globalState.update('version', version)
}

export function clearNotificationState(ctx: ExtensionContext) {
  ctx.globalState.update('notifications-ids', undefined)
  ctx.globalState.update('version', undefined)
}
