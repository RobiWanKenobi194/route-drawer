import { useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import Toolbar from './components/Toolbar'
import { totalDistance, formatDistance } from './utils/distance'
import { downloadGpx } from './utils/gpx'
import { fetchSnappedRoute } from './utils/routing'
import { loadDraft, saveDraft, loadSavedRoutes, saveSavedRoutes, MAX_SAVED_ROUTES } from './utils/storage'
import './App.css'

const draft = loadDraft()

export default function App() {
  const [points, setPoints] = useState(draft?.points ?? [])
  const [routeName, setRouteName] = useState(draft?.routeName ?? 'My Route')
  const [mode, setMode] = useState(draft?.mode ?? 'foot')
  const [activeRouteId, setActiveRouteId] = useState(draft?.activeRouteId ?? null)
  const [flyTo, setFlyTo] = useState(null)

  const [savedRoutes, setSavedRoutes] = useState(() => loadSavedRoutes())
  const [saveError, setSaveError] = useState(null)

  const [routePath, setRoutePath] = useState([])
  const [routeDistanceMeters, setRouteDistanceMeters] = useState(0)
  const [routingLoading, setRoutingLoading] = useState(false)
  const [routingError, setRoutingError] = useState(null)

  const requestIdRef = useRef(0)

  useEffect(() => {
    if (mode === 'straight' || points.length < 2) {
      setRoutePath(points)
      setRouteDistanceMeters(totalDistance(points))
      setRoutingError(null)
      setRoutingLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setRoutingLoading(true)

    const timer = setTimeout(async () => {
      try {
        const { path, distanceMeters } = await fetchSnappedRoute(points, mode)
        if (requestIdRef.current !== requestId) return
        setRoutePath(path)
        setRouteDistanceMeters(distanceMeters)
        setRoutingError(null)
      } catch (err) {
        if (requestIdRef.current !== requestId) return
        setRoutePath(points)
        setRouteDistanceMeters(totalDistance(points))
        setRoutingError(err.message || 'Routing failed, showing straight line instead')
      } finally {
        if (requestIdRef.current === requestId) setRoutingLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [points, mode])

  useEffect(() => {
    saveDraft({ points, routeName, mode, activeRouteId })
  }, [points, routeName, mode, activeRouteId])

  const distanceLabel = useMemo(() => formatDistance(routeDistanceMeters), [routeDistanceMeters])

  function handleAddPoint(pos) {
    setPoints((prev) => [...prev, pos])
  }

  function handleMovePoint(idx, pos) {
    setPoints((prev) => prev.map((p, i) => (i === idx ? pos : p)))
  }

  function handleRemovePoint(idx) {
    setPoints((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleUndo() {
    setPoints((prev) => prev.slice(0, -1))
  }

  function handleClear() {
    setPoints([])
    setActiveRouteId(null)
  }

  function handleExport() {
    downloadGpx(routePath, routeName)
  }

  function handleSelectLocation(loc) {
    setFlyTo(loc)
  }

  function persistSavedRoutes(next) {
    setSavedRoutes(next)
    saveSavedRoutes(next)
  }

  function handleSaveRoute() {
    const existingIndex = savedRoutes.findIndex((r) => r.id === activeRouteId)

    if (existingIndex === -1 && savedRoutes.length >= MAX_SAVED_ROUTES) {
      setSaveError(`You have ${MAX_SAVED_ROUTES} saved routes — delete or export one first.`)
      return
    }

    setSaveError(null)
    const entry = {
      id: activeRouteId ?? crypto.randomUUID(),
      name: routeName,
      points,
      mode,
      updatedAt: Date.now(),
    }

    if (existingIndex === -1) {
      persistSavedRoutes([...savedRoutes, entry])
    } else {
      persistSavedRoutes(savedRoutes.map((r, i) => (i === existingIndex ? entry : r)))
    }
    setActiveRouteId(entry.id)
  }

  function handleLoadRoute(id) {
    const route = savedRoutes.find((r) => r.id === id)
    if (!route) return
    setPoints(route.points)
    setRouteName(route.name)
    setMode(route.mode)
    setActiveRouteId(route.id)
    setSaveError(null)
    if (route.points.length > 0) {
      const [lat, lon] = route.points[0]
      setFlyTo({ lat, lon })
    }
  }

  function handleDeleteRoute(id) {
    persistSavedRoutes(savedRoutes.filter((r) => r.id !== id))
    if (id === activeRouteId) setActiveRouteId(null)
    setSaveError(null)
  }

  function handleRenameRoute(id, newName) {
    const trimmed = newName.trim()
    if (!trimmed) return
    persistSavedRoutes(savedRoutes.map((r) => (r.id === id ? { ...r, name: trimmed } : r)))
    if (id === activeRouteId) setRouteName(trimmed)
  }

  return (
    <div className="app">
      <Toolbar
        routeName={routeName}
        onRouteNameChange={setRouteName}
        distanceLabel={distanceLabel}
        pointCount={points.length}
        mode={mode}
        onModeChange={setMode}
        routingLoading={routingLoading}
        routingError={routingError}
        onUndo={handleUndo}
        onClear={handleClear}
        onExport={handleExport}
        onSelectLocation={handleSelectLocation}
        savedRoutes={savedRoutes}
        activeRouteId={activeRouteId}
        saveError={saveError}
        onSaveRoute={handleSaveRoute}
        onLoadRoute={handleLoadRoute}
        onDeleteRoute={handleDeleteRoute}
        onRenameRoute={handleRenameRoute}
      />
      <div className="map-container">
        <MapView
          points={points}
          routePath={routePath}
          onAddPoint={handleAddPoint}
          onMovePoint={handleMovePoint}
          onRemovePoint={handleRemovePoint}
          flyTo={flyTo}
        />
      </div>
    </div>
  )
}
