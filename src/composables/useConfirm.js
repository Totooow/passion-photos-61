import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

const loading = ref(false)
const confirmModal = ref({ show: false, message: '', onConfirm: null })

export function useConfirm() {
  const { showToast } = useToast()

  function showConfirm(message, onConfirm) {
    confirmModal.value = { show: true, message, onConfirm }
  }

  async function executeConfirm() {
    loading.value = true
    try {
      await confirmModal.value.onConfirm?.()
    } finally {
      loading.value = false
    }
    confirmModal.value.show = false
  }

  async function withLoading(fn, successMsg) {
    loading.value = true
    try {
      await fn()
      showToast(successMsg)
    } catch (e) {
      showToast('Erreur : ' + e.message, 'error')
    } finally {
      loading.value = false
    }
  }

  return { loading, confirmModal, showConfirm, executeConfirm, withLoading }
}
