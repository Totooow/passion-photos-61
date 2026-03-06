<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { useToast } from '@/composables/useToast'

const { fetchOrders } = useAdmin()
const { showToast } = useToast()

const orders = ref([])
const loading = ref(false)
const searchQuery = ref('')

const filtered = computed(() => {
  if (!searchQuery.value) return orders.value
  const q = searchQuery.value.toLowerCase()
  return orders.value.filter(
    (o) =>
      o.email?.toLowerCase().includes(q) ||
      o.name?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.summary?.toLowerCase().includes(q) ||
      o.id?.toLowerCase().includes(q),
  )
})

const totalAmount = computed(() => filtered.value.reduce((sum, o) => sum + (o.amount || 0), 0))
const totalOrders = computed(() => filtered.value.length)

onMounted(async () => {
  loading.value = true
  try {
    const data = await fetchOrders()
    orders.value = [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    loading.value = false
  }
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAmount(cents) {
  return (cents / 100).toFixed(2).replace('.', ',') + ' \u20AC'
}

function parseItems(summary) {
  if (!summary) return []
  return summary.split(' | ').map((item) => {
    const match = item.match(/^(.+?)\s*\((.+?)\)\s*x(\d+)$/)
    if (!match) return { label: item, format: '', qty: 1 }
    return { label: match[1].trim(), format: match[2], qty: parseInt(match[3]) }
  })
}
</script>

<template>
  <div>
    <!-- Header + stats -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-bold text-plum-dark uppercase tracking-wide">Commandes</h2>
    </div>

    <!-- Stats cards -->
    <div v-if="orders.length && !loading" class="grid grid-cols-2 gap-3 mb-5">
      <div class="bg-white rounded-lg border border-plum/8 px-4 py-3">
        <p class="text-[11px] text-plum-muted uppercase tracking-wide mb-0.5">Commandes</p>
        <p class="text-lg font-bold text-plum-dark tabular-nums">{{ totalOrders }}</p>
      </div>
      <div class="bg-white rounded-lg border border-plum/8 px-4 py-3">
        <p class="text-[11px] text-plum-muted uppercase tracking-wide mb-0.5">Chiffre d'affaires</p>
        <p class="text-lg font-bold text-plum-dark tabular-nums">{{ formatAmount(totalAmount) }}</p>
      </div>
    </div>

    <!-- Search -->
    <div v-if="orders.length" class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par nom, email, photo..."
        class="admin-input max-w-xs w-full text-xs"
        @keyup.escape="searchQuery = ''"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-plum-muted py-16 text-sm">
      <span class="spinner mr-1.5"></span>Chargement...
    </div>

    <!-- Empty -->
    <div v-else-if="!orders.length" class="text-center py-20">
      <div class="w-12 h-12 rounded-full bg-plum/5 flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6 text-plum/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="text-sm text-plum-muted">Aucune commande pour le moment</p>
    </div>

    <!-- No results -->
    <div v-else-if="!filtered.length" class="text-center text-plum-muted py-16 text-sm">
      Aucun résultat pour « {{ searchQuery }} »
    </div>

    <!-- Order list -->
    <div v-else class="grid gap-2.5">
      <div
        v-for="order in filtered"
        :key="order.id"
        class="bg-white rounded-xl border border-plum/8 overflow-hidden hover:border-plum/15 transition-colors"
      >
        <!-- Order header -->
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-plum/5 bg-plum/[0.02]">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-plum/8 flex items-center justify-center text-[11px] font-semibold text-plum-dark uppercase">
              {{ (order.name || 'A')[0] }}
            </div>
            <div>
              <span class="text-sm font-medium text-plum-dark">{{ order.name || 'Anonyme' }}</span>
              <span v-if="order.email" class="text-xs text-plum-muted ml-2">{{ order.email }}</span>
              <span v-if="order.phone" class="text-xs text-plum-muted ml-2">{{ order.phone }}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-bold text-plum-dark tabular-nums">{{ formatAmount(order.amount) }}</span>
          </div>
        </div>

        <!-- Order items -->
        <div class="px-4 py-2.5">
          <div class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="(item, i) in parseItems(order.summary)"
              :key="i"
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-plum/5 rounded-md text-[11px] text-plum-dark"
            >
              <span class="font-medium">{{ item.label }}</span>
              <span class="text-plum-muted">{{ item.format }}</span>
              <span v-if="item.qty > 1" class="text-plum/40">x{{ item.qty }}</span>
            </span>
          </div>
          <p class="text-[11px] text-plum-muted tabular-nums">{{ formatDate(order.date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
