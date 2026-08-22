import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { bootAtFromSample, formatUptime, liveUptimeSeconds } from './format.ts'
import type { CopyKey } from './locales.ts'
import styles from './styles.module.css'

export interface ServiceStatusView {
  status: 'running'
  pid: number
  port: number
  host: string
  address: string
  uptime: number
  version: string
  node: string
  portMode: 'default' | 'fixed' | 'auto'
}

export interface ServicePageProps {
  t: (key: CopyKey) => string
}

type Phase = 'running' | 'restarting' | 'stopped'
type Confirm = 'restart' | 'shutdown' | null

const STATUS_PATH = '/dsh-web-lifecycle/status'
const RESTART_PATH = '/dsh-web-lifecycle/restart'
const SHUTDOWN_PATH = '/dsh-web-lifecycle/shutdown'
const POLL_MS = 800
const RESTART_TIMEOUT_MS = 60_000

async function fetchStatus(signal?: AbortSignal): Promise<ServiceStatusView> {
  const response = await fetch(STATUS_PATH, {
    method: 'GET',
    credentials: 'same-origin',
    signal,
  })
  if (!response.ok) throw new Error(`status ${response.status}`)
  return (await response.json()) as ServiceStatusView
}

async function postAction(path: string): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  if (!response.ok) throw new Error(`status ${response.status}`)
}

function portModeLabel(mode: ServiceStatusView['portMode'], t: ServicePageProps['t']): string {
  if (mode === 'fixed') return t('portCustom')
  if (mode === 'auto') return t('portAuto')
  return t('portDefault')
}

export function ServicePage(props: ServicePageProps): ReactElement {
  const { t } = props
  const [status, setStatus] = useState<ServiceStatusView | undefined>()
  const [sampledAt, setSampledAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [phase, setPhase] = useState<Phase>('running')
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const next = await fetchStatus(signal)
    const at = Date.now()
    setStatus(next)
    setSampledAt(at)
    setNow(at)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    refresh(controller.signal).catch(() => {
      setError(t('error'))
    })
    return () => controller.abort()
  }, [refresh, t])

  useEffect(() => {
    if (phase !== 'running' || status === undefined) return
    const id = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, status])

  useEffect(() => {
    if (phase !== 'restarting') return
    const started = Date.now()
    let cancelled = false
    const tick = async () => {
      try {
        const response = await fetch(STATUS_PATH, {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        })
        if (cancelled) return
        if (response.ok) {
          window.location.reload()
          return
        }
      } catch {
        // expected while the process is down
      }
      if (Date.now() - started > RESTART_TIMEOUT_MS) {
        setError(t('restartTimeout'))
        setPhase('running')
        setBusy(false)
        return
      }
      window.setTimeout(() => {
        void tick()
      }, POLL_MS)
    }
    void tick()
    return () => {
      cancelled = true
    }
  }, [phase, t])

  const runRestart = async () => {
    setConfirm(null)
    setBusy(true)
    setError(undefined)
    try {
      await postAction(RESTART_PATH)
      setPhase('restarting')
    } catch {
      setError(t('error'))
      setBusy(false)
    }
  }

  const runShutdown = async () => {
    setConfirm(null)
    setBusy(true)
    setError(undefined)
    try {
      await postAction(SHUTDOWN_PATH)
      setPhase('stopped')
    } catch {
      setError(t('error'))
      setBusy(false)
    }
  }

  if (phase === 'stopped') {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>{t('title')}</h2>
        <div className={styles.stopped}>
          <div className={styles.statusRow}>
            <span className={`${styles.dot} ${styles.dotStopped}`} />
            <span className={styles.statusLabel}>{t('shutdownTitle')}</span>
          </div>
          <p className={styles.hint}>{t('shutdownHint')}</p>
          <p className={styles.hint}>{t('shutdownHint2')}</p>
        </div>
      </section>
    )
  }

  const restarting = phase === 'restarting'
  const disabled = busy || restarting
  const uptime =
    status === undefined
      ? undefined
      : formatUptime(liveUptimeSeconds(bootAtFromSample(status.uptime, sampledAt), now))

  return (
    <section className={styles.section}>
      <div>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.intro}>{t('intro')}</p>
      </div>
      <div className={styles.card}>
        <div>
          <div className={styles.statusRow}>
            <span className={`${styles.dot} ${restarting ? styles.dotRestarting : ''}`} />
            <span className={styles.statusLabel}>{restarting ? t('restarting') : t('running')}</span>
          </div>
          <p className={styles.hint}>{restarting ? t('restartingHint') : t('runningHint')}</p>
        </div>
        {status !== undefined ? (
          <dl className={styles.facts}>
            <dt>{t('address')}</dt>
            <dd>
              {status.address}
              <span className={styles.badge}>{portModeLabel(status.portMode, t)}</span>
            </dd>
            <dt>{t('pid')}</dt>
            <dd>{status.pid}</dd>
            <dt>{t('uptime')}</dt>
            <dd>{uptime}</dd>
            <dt>{t('version')}</dt>
            <dd>{status.version}</dd>
          </dl>
        ) : null}
        {error !== undefined ? (
          <p className={styles.error} role="status">
            {error}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button type="button" className={styles.primary} disabled={disabled} onClick={() => setConfirm('restart')}>
            {t('restart')}
          </button>
          <button type="button" className={styles.danger} disabled={disabled} onClick={() => setConfirm('shutdown')}>
            {t('shutdown')}
          </button>
        </div>
      </div>
      {confirm !== null ? (
        <div className={styles.overlay} role="presentation" onClick={() => setConfirm(null)}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dsh-web-lifecycle-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="dsh-web-lifecycle-confirm-title" className={styles.dialogTitle}>
              {confirm === 'restart' ? t('restartConfirmTitle') : t('shutdownConfirmTitle')}
            </h3>
            <p className={styles.dialogBody}>
              {confirm === 'restart' ? t('restartConfirmBody') : t('shutdownConfirmBody')}
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.ghost} onClick={() => setConfirm(null)}>
                {t('cancel')}
              </button>
              {confirm === 'restart' ? (
                <button type="button" className={styles.primary} onClick={() => void runRestart()}>
                  {t('restart')}
                </button>
              ) : (
                <button type="button" className={styles.danger} onClick={() => void runShutdown()}>
                  {t('shutdown')}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
