import { ref } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

export function useAdminPhotos() {
  const { updatePhoto: apiUpdatePhoto, removePhoto: apiRemovePhoto } = useAdmin()
  const { showToast } = useToast()
  const { loading, showConfirm, withLoading } = useConfirm()

  const editingPhoto = ref(null)
  const editForm = ref({})
  const editModal = ref({ show: false, photo: null })

  function openEdit(photo, viewMode) {
    if (viewMode === 'grid') {
      editModal.value = { show: true, photo }
    } else {
      editingPhoto.value = photo.id
      editForm.value = { title: photo.title, prices: { ...photo.prices } }
    }
  }

  function saveEdit(photo, form) {
    const data = form || editForm.value
    withLoading(async () => {
      await apiUpdatePhoto(photo.id, { title: data.title, prices: data.prices })
      editingPhoto.value = null
      editModal.value = { show: false, photo: null }
    }, 'Modifié')
  }

  function cancelEdit() {
    editingPhoto.value = null
    editModal.value = { show: false, photo: null }
  }

  function removePhoto(photo) {
    showConfirm(`Supprimer "${photo.title}" ?`, () => withLoading(() => apiRemovePhoto(photo.id), 'Photo supprimée'))
  }

  function bulkDelete(selectedIds, deselectAll) {
    const count = selectedIds.value.size
    showConfirm(`Supprimer ${count} photo(s) ?`, async () => {
      loading.value = true
      let errors = 0
      for (const id of selectedIds.value) {
        try {
          await apiRemovePhoto(id)
        } catch {
          errors++
        }
      }
      loading.value = false
      const deleted = count - errors
      deselectAll()
      if (errors === 0) showToast(`${deleted} photo(s) supprimée(s)`)
      else showToast(`${deleted}/${count} supprimée(s)`, 'error')
    })
  }

  return { editingPhoto, editForm, editModal, openEdit, saveEdit, cancelEdit, removePhoto, bulkDelete }
}
