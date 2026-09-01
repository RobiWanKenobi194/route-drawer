export async function searchPlace(query, signal) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!res.ok) throw new Error('Search failed')
  const results = await res.json()
  return results.map((r) => ({
    label: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }))
}
