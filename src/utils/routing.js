const VALHALLA_URL = 'https://valhalla1.openstreetmap.de/route'

const COSTING_BY_MODE = {
  foot: 'pedestrian',
  bike: 'bicycle',
  car: 'auto',
}

function decodePolyline6(encoded) {
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates = []
  const factor = 1e6

  while (index < encoded.length) {
    let result = 1
    let shift = 0
    let b
    do {
      b = encoded.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    result = 1
    shift = 0
    do {
      b = encoded.charCodeAt(index++) - 63 - 1
      result += b << shift
      shift += 5
    } while (b >= 0x1f)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    coordinates.push([lat / factor, lng / factor])
  }
  return coordinates
}

// Routes through waypoints snapped to the road/path network.
// Throws on failure so callers can fall back to straight lines.
export async function fetchSnappedRoute(points, mode) {
  const costing = COSTING_BY_MODE[mode]
  if (!costing) throw new Error(`Unknown routing mode: ${mode}`)
  if (points.length < 2) return { path: points, distanceMeters: 0 }

  const body = {
    locations: points.map(([lat, lon]) => ({ lat, lon })),
    costing,
    units: 'kilometers',
  }

  const res = await fetch(VALHALLA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Routing failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const legs = data?.trip?.legs
  if (!legs || legs.length === 0) throw new Error('No route found')

  const path = legs.flatMap((leg) => decodePolyline6(leg.shape))
  const distanceMeters = (data.trip.summary?.length ?? 0) * 1000

  return { path, distanceMeters }
}
