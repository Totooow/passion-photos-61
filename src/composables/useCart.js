import { reactive, computed } from 'vue'
import { CONTACT_EMAIL } from '@/config'

const STORAGE_KEY = 'passion-photos-61-cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const state = reactive({
  items: loadCart(),
})

export function useCart() {
  const itemCount = computed(() => state.items.length)
  const total = computed(() => state.items.reduce((sum, item) => sum + item.price, 0))

  function cartKey(photoId, formatId) {
    return `${photoId}__${formatId}`
  }

  function addItem(photo, formatId, formatLabel, price) {
    const key = cartKey(photo.id, formatId)
    if (state.items.some((item) => item.key === key)) return
    state.items.push({
      key,
      id: photo.id,
      title: photo.title,
      src: photo.src,
      formatId,
      formatLabel,
      price,
    })
    saveCart(state.items)
  }

  function removeItem(key) {
    const index = state.items.findIndex((item) => item.key === key)
    if (index !== -1) {
      state.items.splice(index, 1)
      saveCart(state.items)
    }
  }

  function isInCart(photoId, formatId) {
    const key = cartKey(photoId, formatId)
    return computed(() => state.items.some((item) => item.key === key))
  }

  function clearCart() {
    state.items.splice(0, state.items.length)
    saveCart(state.items)
  }

  function buildMailto() {
    const subject = encodeURIComponent('Commande Passion Photos 61')
    const lines = state.items.map((item) => `- ${item.title} (${item.formatLabel}) : ${item.price}\u00A0\u20AC`)
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite commander les photos suivantes :\n\n${lines.join('\n')}\n\nTotal : ${total.value}\u00A0\u20AC\n\nMerci !`
    )
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return {
    items: computed(() => state.items),
    itemCount,
    total,
    addItem,
    removeItem,
    isInCart,
    clearCart,
    buildMailto,
  }
}
