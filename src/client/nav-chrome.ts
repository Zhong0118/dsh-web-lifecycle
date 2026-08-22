const ATTR = 'data-dsh-web-lifecycle-nav'
const STYLE_ID = 'dsh-web-lifecycle-nav-chrome'

const LABELS = new Set(['重启关闭', 'Restart & Shut Down'])

const POWER_SVG = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="dsh-web-lifecycle-power">
  <path d="M8 1.5v6.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M4.15 3.7a5.2 5.2 0 1 0 7.7 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID) !== null) return
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.textContent = `
[${ATTR}] {
  color: var(--dsw-alias-state-error-primary) !important;
}
[${ATTR}] span,
[${ATTR}] svg {
  color: var(--dsw-alias-state-error-primary) !important;
}
`
  document.head.appendChild(tag)
}

function decorate(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[role="dialog"] nav button')
  for (const button of buttons) {
    const label = button.querySelector('span')?.textContent?.trim() ?? ''
    const match = LABELS.has(label)
    if (!match) {
      if (button.hasAttribute(ATTR)) {
        button.removeAttribute(ATTR)
      }
      continue
    }
    if (button.getAttribute(ATTR) === '1') continue
    button.setAttribute(ATTR, '1')
    const svg = button.querySelector('svg')
    if (svg !== null) svg.outerHTML = POWER_SVG
  }
}

/**
 * Official settings nav hard-codes icons by section id (gear for unknowns).
 * Paint this plugin's row as a red power switch after the shell mounts it.
 */
export function startNavChrome(): () => void {
  ensureStyle()
  decorate()
  const observer = new MutationObserver(() => {
    decorate()
  })
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  return () => observer.disconnect()
}
