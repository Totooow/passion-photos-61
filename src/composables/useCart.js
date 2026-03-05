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
  const itemCount = computed(() => state.items.reduce((sum, item) => sum + item.qty, 0))
  const total = computed(() => state.items.reduce((sum, item) => sum + item.price * item.qty, 0))

  function cartKey(photoId, formatId) {
    return `${photoId}__${formatId}`
  }

  function addItem(photo, formatId, formatLabel, price, formatType) {
    const key = cartKey(photo.id, formatId)
    const existing = state.items.find((item) => item.key === key)
    if (existing) {
      if (formatType === 'print') {
        existing.qty += 1
      }
      saveCart(state.items)
      return
    }
    state.items.push({
      key,
      id: photo.id,
      title: photo.title,
      src: photo.src,
      formatId,
      formatLabel,
      formatType: formatType || 'print',
      price,
      qty: 1,
    })
    saveCart(state.items)
  }

  function updateQty(key, qty) {
    const item = state.items.find((i) => i.key === key)
    if (!item) return
    if (qty < 1) {
      removeItem(key)
      return
    }
    item.qty = qty
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
    return state.items.some((item) => item.key === key)
  }

  function getQty(photoId, formatId) {
    const key = cartKey(photoId, formatId)
    const item = state.items.find((i) => i.key === key)
    return item ? item.qty : 0
  }

  function clearCart() {
    state.items.splice(0, state.items.length)
    saveCart(state.items)
  }

  function buildMailto() {
    const subject = encodeURIComponent('Commande Passion Photos 61')
    const lines = state.items.map((item) => {
      const qty = item.qty
      const lineTotal = item.price * qty
      return qty > 1
        ? `- ${item.title} (${item.formatLabel}) x${qty} : ${lineTotal}\u00A0\u20AC`
        : `- ${item.title} (${item.formatLabel}) : ${lineTotal}\u00A0\u20AC`
    })
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite commander les photos suivantes :\n\n${lines.join('\n')}\n\nTotal : ${total.value}\u00A0\u20AC\n\nMerci !`,
    )
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return {
    items: computed(() => state.items),
    itemCount,
    total,
    addItem,
    updateQty,
    removeItem,
    isInCart,
    getQty,
    clearCart,
    buildMailto,
  }
}
