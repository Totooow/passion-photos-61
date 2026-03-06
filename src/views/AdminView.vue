<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdmin } from '@/composables/useAdmin'
import { useConfirm } from '@/composables/useConfirm'

import AdminConnectModal from '@/components/admin/AdminConnectModal.vue'
import AdminConfirmModal from '@/components/admin/AdminConfirmModal.vue'
import AdminToast from '@/components/admin/AdminToast.vue'

const route = useRoute()
const { connected, connecting, error, catalog, connectAdmin, disconnect, tryReconnect } = useAdmin()
const { loading, confirmModal, executeConfirm } = useConfirm()

// ── Auth ──
const showConnectModal = ref(false)
const autoConnecting = ref(false)

onMounted(async () => {
  autoConnecting.value = true
  await tryReconnect()
  autoConnecting.value = false
})

async function handleConnect(key) {
  await connectAdmin(key)
  if (connected.value) showConnectModal.value = false
}

// ── Navigation ──
const isInsideFolder = computed(() => route.name === 'admin-folder')
const folderObj = computed(() => {
  if (!isInsideFolder.value) return null
  return catalog.value.folders.find((f) => f.id === route.params.folderId)
})
</script>

<template>
  <div class="min-h-screen bg-cream/30">
    <!-- Top bar -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-plum/10">
      <div class="max-w-5xl mx-auto px-4 h-12 flex items-center gap-3">
        <span class="text-sm font-bold text-plum-dark tracking-tight">Admin</span>

        <template v-if="connected">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 ml-1"></span>
          <span class="text-xs text-plum-muted">{{ catalog.photos.length }} photos</span>

          <template v-if="isInsideFolder">
            <span class="text-plum/20 text-xs">/</span>
            <router-link class="text-xs text-plum hover:underline" :to="{ name: 'admin' }">Dossiers</router-link>
            <span class="text-plum/20 text-xs">/</span>
            <span class="text-xs font-semibold text-plum-dark">{{ folderObj?.name }}</span>
          </template>

          <div class="ml-auto flex items-center gap-2">
            <button class="text-xs text-plum-muted hover:text-red-500 transition-colors" @click="disconnect">
              Quitter
            </button>
          </div>
        </template>

        <template v-else-if="autoConnecting">
          <span class="spinner text-plum ml-1"></span>
          <span class="text-xs text-plum-muted">Reconnexion...</span>
        </template>

        <template v-else>
          <div class="ml-auto">
            <button
              class="px-3 py-1 bg-plum text-white text-xs font-medium rounded-md hover:bg-plum-light transition-colors"
              @click="showConnectModal = true"
            >
              Se connecter
            </button>
          </div>
        </template>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-5xl mx-auto px-4 py-6">
      <div v-if="autoConnecting" class="text-center text-plum-muted py-20 text-sm">
        <span class="spinner mr-1.5"></span>Reconnexion en cours...
      </div>

      <div v-else-if="!connected" class="text-center text-plum-muted py-20 text-sm">
        Connectez-vous pour accéder au catalogue.
      </div>

      <template v-else>
        <!-- Tabs (only on folders/orders views, not inside a folder) -->
        <div v-if="!isInsideFolder" class="flex gap-1 mb-5 bg-plum/5 rounded-md p-0.5 w-fit">
          <router-link
            :to="{ name: 'admin' }"
            class="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            :class="route.name === 'admin' ? 'bg-white shadow-sm text-plum-dark' : 'text-plum/40 hover:text-plum/60'"
          >
            Dossiers
          </router-link>
          <router-link
            :to="{ name: 'admin-orders' }"
            class="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            :class="route.name === 'admin-orders' ? 'bg-white shadow-sm text-plum-dark' : 'text-plum/40 hover:text-plum/60'"
          >
            Commandes
          </router-link>
        </div>

        <router-view />
      </template>
    </main>

    <!-- Global modals -->
    <AdminConnectModal
      :show="showConnectModal"
      :connecting="connecting"
      :error="error"
      @connect="handleConnect"
      @cancel="showConnectModal = false"
    />

    <AdminConfirmModal
      :show="confirmModal.show"
      :message="confirmModal.message"
      :loading="loading"
      @confirm="executeConfirm"
      @cancel="confirmModal.show = false"
    />

    <AdminToast />
  </div>
</template>
