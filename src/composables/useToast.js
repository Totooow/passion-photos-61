import { ref } from 'vue'

const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

export function useToast() {
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer)
    toast.value = { show: true, message, type }
    toastTimer = setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  return { toast, showToast }
}
