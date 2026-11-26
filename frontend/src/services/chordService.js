
import api from './api'

export async function getChords(
  params = {},
  signal
) {
  const response = await api.get('chords/', {
    params,
    signal,
  })

  return response.data
}

export async function getChord(slug, signal) {
  const response = await api.get(
    `chords/${encodeURIComponent(slug)}/`,
    { signal }
  )

  return response.data
}

export async function getAllChords(signal) {
  let page = 1
  let chords = []

  while (true) {
    const data = await getChords(
      { page },
      signal
    )

    chords = [...chords, ...data.results]

    if (!data.next) break

    page += 1
  }

  return chords
}

