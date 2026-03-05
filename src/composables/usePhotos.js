import { ref } from 'vue'
import { S3_BASE_URL } from '@/config'

const photos = ref([])
const folders = ref([])
const formats = ref([])
const loading = ref(false)
const error = ref(null)
let fetched = false

export function catalogUrl() {
  return S3_BASE_URL ? `${S3_BASE_URL}/photos.json` : '/photos.json'
}

export function usePhotos() {
  async function fetchPhotos() {
    if (fetched) return
    loading.value = true
    error.value = null
    try {
      const res = await fetch(catalogUrl())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      folders.value = data.folders || []
      formats.value = data.formats || []
      photos.value = data.photos || []
      fetched = true
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function photosByFolder(folderId) {
    if (!folderId) return photos.value
    return photos.value.filter((p) => p.folder === folderId)
  }

  function photoUrl(src) {
    if (!src) return ''
    if (src.startsWith('http')) return src
    return S3_BASE_URL ? `${S3_BASE_URL}/${src}` : `/${src}`
  }

  return {
    photos,
    folders,
    formats,
    loading,
    error,
    fetchPhotos,
    photosByFolder,
    photoUrl,
  }
}
