import { useEffect } from 'react'
import { getMetrikaId, isAnalyticsEnabled, trackGoal } from '../lib/analytics.js'

function resolveGoalName(href) {
  if (href.startsWith('tel:')) {
    return 'phone_click'
  }

  if (href.includes('wa.me') || href.includes('whatsapp')) {
    return 'whatsapp_click'
  }

  if (href.includes('telegram') || href.includes('t.me')) {
    return 'telegram_click'
  }

  return ''
}

export function AnalyticsBootstrap() {
  useEffect(() => {
    if (!isAnalyticsEnabled() || typeof window === 'undefined') {
      return undefined
    }

    const metrikaId = getMetrikaId()

    if (typeof window.ym !== 'function') {
      ;(function (m, e, t, r, i, k, a) {
        m[i] =
          m[i] ||
          function () {
            ;(m[i].a = m[i].a || []).push(arguments)
          }
        m[i].l = Number(new Date())
        k = e.createElement(t)
        a = e.getElementsByTagName(t)[0]
        k.async = true
        k.src = r
        a.parentNode.insertBefore(k, a)
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym')
    }

    window.ym(metrikaId, 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      trackLinks: true,
      webvisor: true,
    })

    return undefined
  }, [])

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const link = event.target.closest('a[href]')

      if (!link) {
        return
      }

      const href = link.getAttribute('href') ?? ''
      const goalName = resolveGoalName(href)

      if (goalName) {
        trackGoal(goalName)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  return null
}
