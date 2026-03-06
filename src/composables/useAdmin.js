import { ref } from 'vue'
import { catalogUrl } from '@/composables/usePhotos'

const API_URL = import.meta.env.VITE_API_URL || ''

const connected = ref(false)
const connecting = ref(false)
const error = ref(null)
const catalog = ref({ folders: [], formats: [], photos: [] })

async function api(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
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
  return res.status === 204 ? null : res.json()
}

export function useAdmin() {
  // ── Connection ──

  async function connectAdmin(key) {
    connecting.value = true
    error.value = null
    try {
      // Authenticate via POST /login — sets HTTP-only cookie
      const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${loginRes.status}`)
      }
      // Auth OK — load catalog from S3 (public)
      const res = await fetch(catalogUrl())
      if (!res.ok) throw new Error(`Catalogue inaccessible (HTTP ${res.status})`)
      catalog.value = await res.json()
      connected.value = true
    } catch (e) {
      error.value = e.message
      connected.value = false
    } finally {
      connecting.value = false
    }
  }

  async function disconnect() {
    await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
    connected.value = false
    catalog.value = { folders: [], formats: [], photos: [] }
  }

  async function tryReconnect() {
    try {
      await api('GET', '/session')
      const res = await fetch(catalogUrl())
      if (!res.ok) return false
      catalog.value = await res.json()
      connected.value = true
      return true
    } catch {
      return false
    }
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

  // ── Orders ──

  async function fetchOrders() {
    const { orders } = await api('GET', '/orders')
    return orders
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
    tryReconnect,
    addFolder,
    renameFolder,
    removeFolder,
    addPhoto,
    updatePhoto,
    removePhoto,
    fetchOrders,
    getPresignedUrl,
  }
}
