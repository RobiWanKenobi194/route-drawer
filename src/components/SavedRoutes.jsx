import { useState } from 'react'

export default function SavedRoutes({ routes, activeRouteId, onLoad, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  function startRename(route) {
    setEditingId(route.id)
    setEditValue(route.name)
  }

  function commitRename() {
    if (editingId) onRename(editingId, editValue)
    setEditingId(null)
  }

  if (routes.length === 0) {
    return <p className="saved-routes-empty">No saved routes yet.</p>
  }

  return (
    <ul className="saved-routes-list">
      {routes.map((route) => (
        <li key={route.id} className={route.id === activeRouteId ? 'active' : ''}>
          {editingId === route.id ? (
            <input
              className="rename-input"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditingId(null)
              }}
            />
          ) : (
            <button className="route-name-btn" onClick={() => onLoad(route.id)} title="Load this route">
              {route.name}
            </button>
          )}

          {editingId !== route.id && (
            <div className="route-item-actions">
              <button className="icon-btn" title="Rename" onClick={() => startRename(route)}>
                ✎
              </button>
              <button className="icon-btn" title="Delete" onClick={() => onDelete(route.id)}>
                ×
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
