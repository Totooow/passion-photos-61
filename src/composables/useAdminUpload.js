import { useAdmin } from '@/composables/useAdmin'
import { useToast } from '@/composables/useToast'

export function useAdminUpload() {
  const { catalog, getPresignedUrl, addPhoto: apiAddPhoto } = useAdmin()
  const { showToast } = useToast()

  function uniqueKey(fileName) {
    const ext = fileName.match(/\.[^.]+$/)?.[0] || ''
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    return `preview/${id}${ext}`
  }

  async function uploadPhotos({ files, defaultPrices, onProgress, onStart, onDone }, folder) {
    if (!folder) return

    onStart()
    let done = 0
    let errors = 0
    const total = files.length

    for (const item of files) {
      const key = uniqueKey(item.file.name)
      try {
        const url = await getPresignedUrl(key, item.file.type)
        const uploadRes = await fetch(url, {
          method: 'PUT',
          body: item.file,
          headers: { 'Content-Type': item.file.type, 'x-amz-acl': 'public-read' },
        })
        if (!uploadRes.ok) throw new Error(`Upload HTTP ${uploadRes.status}`)

        const title = item.file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        const prices = {}
        catalog.value.formats.forEach((format) => {
          prices[format.id] = defaultPrices[format.id] || 0
        })
        await apiAddPhoto({ folder, title, src: key, prices })
      } catch (e) {
        showToast(`Erreur : ${item.file.name} — ${e.message}`, 'error')
        errors++
      }
      done++
      onProgress(Math.round((done / total) * 100))
    }

    onDone()

    if (errors === 0) showToast(`${done} photo(s) uploadée(s)`)
    else showToast(`${done - errors}/${done} photo(s) uploadée(s)`, 'error')
  }

  return { uploadPhotos }
}
