
import api from './api'

export async function getSongs(
  params = {},
  signal
) {
  const response = await api.get('songs/', {
    params,
    signal,
  })

  return response.data
}

export async function getSong(slug, signal) {
  const response = await api.get(
    `songs/${encodeURIComponent(slug)}/`,
    { signal }
  )

  return response.data
}

export async function getArtists(
  params = {},
  signal
) {
  const response = await api.get('artists/', {
    params,
    signal,
  })

  return response.data
}
