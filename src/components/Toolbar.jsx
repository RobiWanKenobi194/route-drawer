import { useEffect, useRef, useState } from 'react'
import { searchPlace } from '../utils/geocode'
import SavedRoutes from './SavedRoutes'
import { MAX_SAVED_ROUTES } from '../utils/storage'

const SEARCH_DEBOUNCE_MS = 400

const MODES = [
  { value: 'foot', label: 'Walking' },
  { value: 'bike', label: 'Cycling' },
  { value: 'car', label: 'Driving' },
  { value: 'straight', label: 'Straight line' },
]

export default function Toolbar({
  routeName,
  onRouteNameChange,
  distanceLabel,
  pointCount,
  mode,
  onModeChange,
  routingLoading,
  routingError,
  onUndo,
  onClear,
  onExport,
  onSelectLocation,
  savedRoutes,
  activeRouteId,
  saveError,
  onSaveRoute,
  onLoadRoute,
  onDeleteRoute,
  onRenameRoute,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [])

  async function runSearch(q) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setSearching(true)
    setSearchError(null)
    try {
      const found = await searchPlace(q, controller.signal)
      setResults(found)
      setShowResults(true)
      if (found.length === 0) setSearchError('No places found.')
    } catch (err) {
      if (err.name === 'AbortError') return
      setResults([])
      setSearchError('Search failed. Try again.')
    } finally {
      setSearching(false)
    }
  }

  function handleQueryChange(value) {
    setQuery(value)
    clearTimeout(debounceRef.current)

    if (!value.trim()) {
      abortRef.current?.abort()
      setResults([])
      setSearchError(null)
      setShowResults(false)
      return
    }

    setShowResults(true)
    debounceRef.current = setTimeout(() => runSearch(value), SEARCH_DEBOUNCE_MS)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    clearTimeout(debounceRef.current)
    runSearch(query)
  }

  function handleSelectResult(r) {
    onSelectLocation(r)
    setResults([])
    setQuery(r.label)
    setShowResults(false)
  }

  return (
    <div className="toolbar">
      <h1>Route Drawer</h1>

      <div className="search-wrapper">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search a place..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onKeyDown={(e) => e.key === 'Escape' && setShowResults(false)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
          />
          <button type="submit" disabled={searching || !query.trim()}>
            {searching ? '...' : 'Go'}
          </button>
        </form>

        {showResults && (results.length > 0 || searchError) && (
          <ul className="search-results">
            {results.map((r, i) => (
              <li key={i} onMouseDown={() => handleSelectResult(r)}>
                {r.label}
              </li>
            ))}
            {results.length === 0 && searchError && <li className="search-no-results">{searchError}</li>}
          </ul>
        )}
      </div>

      <div className="field">
        <label htmlFor="route-name">Route name</label>
        <input
          id="route-name"
          type="text"
          value={routeName}
          onChange={(e) => onRouteNameChange(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="route-mode">Routing</label>
        <select id="route-mode" value={mode} onChange={(e) => onModeChange(e.target.value)}>
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {routingLoading && <p className="routing-status">Snapping to roads…</p>}
      {routingError && <p className="routing-status routing-error">{routingError}</p>}

      <div className="stats">
        <div>
          <span className="stat-value">{pointCount}</span>
          <span className="stat-label">points</span>
        </div>
        <div>
          <span className="stat-value">{distanceLabel}</span>
          <span className="stat-label">distance</span>
        </div>
      </div>

      <div className="actions">
        <button onClick={onUndo} disabled={pointCount === 0}>
          Undo last point
        </button>
        <button onClick={onClear} disabled={pointCount === 0}>
          Clear route
        </button>
      </div>

      <div className="save-export-row">
        <button className="save-btn" onClick={onSaveRoute} disabled={pointCount < 2}>
          {activeRouteId ? 'Update Route' : 'Save Route'}
        </button>
        <button className="export-btn" onClick={onExport} disabled={pointCount < 2}>
          Export GPX
        </button>
      </div>

      <div className="saved-routes">
        <h2>
          Saved routes ({savedRoutes.length}/{MAX_SAVED_ROUTES})
        </h2>
        {saveError && <p className="routing-status routing-error">{saveError}</p>}
        <SavedRoutes
          routes={savedRoutes}
          activeRouteId={activeRouteId}
          onLoad={onLoadRoute}
          onDelete={onDeleteRoute}
          onRename={onRenameRoute}
        />
      </div>

      <div className="help">
        <p>Click the map to add points. Drag a point to move it. Right-click a point to remove it.</p>
        <p>Click (or drag a point) near the first pin to snap onto it and close the loop.</p>
        <p>Walking/Cycling/Driving snap your points to the real road & path network. Straight line skips routing.</p>
        <p>Save a route to keep it in the list below (up to {MAX_SAVED_ROUTES}). Click a saved route to reload it; hover it to rename or delete.</p>
        <p>
          To get it into Strava: on strava.com open <strong>Routes → Create Route</strong> and look for the
          file import option, or upload the GPX as an activity from the app/website.
        </p>
      </div>
    </div>
  )
}
