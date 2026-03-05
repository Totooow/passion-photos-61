import { ref } from 'vue'
import { catalogUrl } from '@/composables/usePhotos'

const API_URL = import.meta.env.VITE_API_URL || ''

const apiKey = ref(sessionStorage.getItem('pp61_api_key') || '')
const connected = ref(false)
const connecting = ref(false)
const error = ref(null)
const catalog = ref({ folders: [], formats: [], photos: [] })

async function api(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey.value}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let msg
    try {
      const data = await res.json()
      msg = data.error || `HTTP ${res.status}`
    } catch {
      msg = `HTTP ${res.status}`
    }
    throw new Error(msg)
  }
  return res.json()
}

export function useAdmin() {
  // ── Connection ──

  async function connectAdmin(key) {
    connecting.value = true
    error.value = null
    try {
      apiKey.value = key
      await api('GET', '/ping')
      // Auth OK — load catalog from S3 (public)
      const res = await fetch(catalogUrl())
      if (!res.ok) throw new Error(`Catalogue inaccessible (HTTP ${res.status})`)
      catalog.value = await res.json()
      connected.value = true
      sessionStorage.setItem('pp61_api_key', key)
    } catch (e) {
      error.value = e.message
      connected.value = false
      apiKey.value = ''
    } finally {
      connecting.value = false
    }
  }

  function disconnect() {
    connected.value = false
    catalog.value = { folders: [], formats: [], photos: [] }
    apiKey.value = ''
    sessionStorage.removeItem('pp61_api_key')
  }

  function loadSavedKey() {
    return sessionStorage.getItem('pp61_api_key')
  }

  // ── Folders ──

  async function addFolder(name) {
    const { folder } = await api('POST', '/folders', { name })
    catalog.value.folders.push(folder)
    return folder
  }

  async function renameFolder(id, name) {
    const { folder } = await api('PUT', `/folders/${id}`, { name })
    const found = catalog.value.folders.find((f) => f.id === id)
    if (found) found.name = folder.name
  }

  async function removeFolder(id) {
    await api('DELETE', `/folders/${id}`)
    catalog.value.photos = catalog.value.photos.filter((p) => p.folder !== id)
    catalog.value.folders = catalog.value.folders.filter((f) => f.id !== id)
  }

  // ── Photos ──

  async function addPhoto(data) {
    const { photo } = await api('POST', '/photos', data)
    catalog.value.photos.push(photo)
    return photo
  }

  async function updatePhoto(id, data) {
    const { photo } = await api('PUT', `/photos/${id}`, data)
    const found = catalog.value.photos.find((p) => p.id === id)
    if (found) {
      if (photo.title !== undefined) found.title = photo.title
      if (photo.prices !== undefined) found.prices = photo.prices
    }
  }

  async function removePhoto(id) {
    await api('DELETE', `/photos/${id}`)
    catalog.value.photos = catalog.value.photos.filter((p) => p.id !== id)
  }

  // ── Upload ──

  async function getPresignedUrl(key, contentType) {
    const { url } = await api('POST', '/presign', { key, contentType })
    return url
  }

  return {
    connected,
    connecting,
    error,
    catalog,
    connectAdmin,
    disconnect,
    loadSavedKey,
    addFolder,
    renameFolder,
    removeFolder,
    addPhoto,
    updatePhoto,
    removePhoto,
    getPresignedUrl,
  }
}
