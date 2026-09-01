import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const SNAP_PIXELS = 18

// Emmerich am Rhein, North Rhine-Westphalia, Germany
const DEFAULT_CENTER = [51.8322137, 6.2428283]
const DEFAULT_ZOOM = 13

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Snaps a candidate lat/lng to the route's start point when it's visually
// close on screen, so closing a loop lands exactly back on the start.
function snapToStartIfClose(map, latlng, points) {
  if (points.length < 2) return [latlng.lat, latlng.lng]
  const candidatePx = map.latLngToContainerPoint(latlng)
  const startPx = map.latLngToContainerPoint(L.latLng(points[0][0], points[0][1]))
  if (candidatePx.distanceTo(startPx) <= SNAP_PIXELS) return points[0]
  return [latlng.lat, latlng.lng]
}

function ClickHandler({ onAddPoint, points }) {
  const map = useMapEvents({
    click(e) {
      onAddPoint(snapToStartIfClose(map, e.latlng, points))
    },
  })
  return null
}

function FlyToLocation({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lon], 14)
    }
  }, [location, map])
  return null
}

function RouteMarkers({ points, onMovePoint, onRemovePoint }) {
  const map = useMap()
  return (
    <>
      {points.map((pos, idx) => (
        <Marker
          key={idx}
          position={pos}
          icon={defaultIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng()
              const finalPos = idx === 0 ? [latlng.lat, latlng.lng] : snapToStartIfClose(map, latlng, points)
              onMovePoint(idx, finalPos)
            },
            contextmenu: () => onRemovePoint(idx),
          }}
        />
      ))}
    </>
  )
}

export default function MapView({ points, routePath, onAddPoint, onMovePoint, onRemovePoint, flyTo }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onAddPoint={onAddPoint} points={points} />
      <FlyToLocation location={flyTo} />
      {routePath.length > 1 && <Polyline positions={routePath} pathOptions={{ color: '#fc4c02', weight: 4 }} />}
      <RouteMarkers points={points} onMovePoint={onMovePoint} onRemovePoint={onRemovePoint} />
    </MapContainer>
  )
}
