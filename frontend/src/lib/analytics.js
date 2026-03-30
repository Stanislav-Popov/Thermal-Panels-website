const metrikaId = Number(import.meta.env.VITE_YANDEX_METRIKA_ID ?? 0)

export function isAnalyticsEnabled() {
  return Number.isInteger(metrikaId) && metrikaId > 0
}

export function trackGoal(goalName, params) {
  if (!isAnalyticsEnabled() || typeof window.ym !== 'function') {
    return
  }

  if (params && Object.keys(params).length > 0) {
    window.ym(metrikaId, 'reachGoal', goalName, params)
    return
  }

  window.ym(metrikaId, 'reachGoal', goalName)
}

export function getMetrikaId() {
  return metrikaId
}
