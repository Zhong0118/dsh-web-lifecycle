import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { en, zh } from './locales.ts'
import { startNavChrome } from './nav-chrome.ts'
import { ServicePage } from './ServicePage.tsx'

const NS = 'web-lifecycle'

export const inject = ['slots', 'locale']

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'web-lifecycle: dictionaries')
  ctx.effect(() => startNavChrome(), 'web-lifecycle: settings nav chrome')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: 'service',
        order: 80,
        label: () => t('nav'),
        locale: NS,
      },
      () => <ServicePage t={t} />,
    ),
  )
}
