const DRAFT_KEY = 'routeDrawer.draft'
const SAVED_ROUTES_KEY = 'routeDrawer.savedRoutes'

export const MAX_SAVED_ROUTES = 5

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private browsing, quota, etc) - fail silently
  }
}

export function loadDraft() {
  return safeGet(DRAFT_KEY)
}

export function saveDraft(draft) {
  safeSet(DRAFT_KEY, draft)
}

export function loadSavedRoutes() {
  const routes = safeGet(SAVED_ROUTES_KEY)
  return Array.isArray(routes) ? routes : []
}

export function saveSavedRoutes(routes) {
  safeSet(SAVED_ROUTES_KEY, routes)
}
