<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { useSearchPagination } from '@/composables/useSearchPagination'
import { useSelection } from '@/composables/useSelection'
import { useAdminUpload } from '@/composables/useAdminUpload'
import { useConfirm } from '@/composables/useConfirm'
import { useAdminFolders } from '@/composables/useAdminFolders'
import { useAdminPhotos } from '@/composables/useAdminPhotos'
import { ADMIN_PER_PAGE } from '@/config'

import AdminConnectModal from '@/components/admin/AdminConnectModal.vue'
import AdminFolderPanel from '@/components/admin/AdminFolderPanel.vue'
import AdminPhotoGrid from '@/components/admin/AdminPhotoGrid.vue'
import AdminUploadModal from '@/components/admin/AdminUploadModal.vue'
import AdminEditModal from '@/components/admin/AdminEditModal.vue'
import AdminConfirmModal from '@/components/admin/AdminConfirmModal.vue'
import AdminToast from '@/components/admin/AdminToast.vue'

// ── Composables ──
const { connected, connecting, error, catalog, connectAdmin, disconnect, loadSavedKey } = useAdmin()
const { loading, confirmModal, executeConfirm } = useConfirm()
const { handleAddFolder, handleRenameFolder, handleRemoveFolder } = useAdminFolders()
const { editingPhoto, editForm, editModal, openEdit, saveEdit, cancelEdit, removePhoto, bulkDelete } = useAdminPhotos()
const { uploadPhotos } = useAdminUpload()
const { selectedIds, selectionActive, toggle: toggleSelect, selectAll, deselectAll } = useSelection()

// ── Auth ──
const showConnectModal = ref(false)
const autoConnecting = ref(false)

onMounted(async () => {
  const saved = loadSavedKey()
  if (saved) {
    autoConnecting.value = true
    await connectAdmin(saved)
    autoConnecting.value = false
  }
})

async function handleConnect(key) {
  await connectAdmin(key)
  if (connected.value) showConnectModal.value = false
}

// ── Navigation ──
const currentFolder = ref(null)
const currentFolderObj = computed(() => catalog.value.folders.find((f) => f.id === currentFolder.value))
const folderPhotos = computed(() => catalog.value.photos.filter((p) => p.folder === currentFolder.value))

const { searchQuery, page, filtered: filteredPhotos, paginated: paginatedPhotos, hasMore, reset: resetSearch } =
  useSearchPagination(folderPhotos, ADMIN_PER_PAGE)

const viewMode = ref('grid')

function openFolder(id) {
  currentFolder.value = id
  resetSearch()
  deselectAll()
}

function goBack() {
  currentFolder.value = null
  editingPhoto.value = null
  resetSearch()
  deselectAll()
}

// ── Upload ──
const showUploadModal = ref(false)
const uploadModalRef = ref(null)

function openUploadModal() {
  uploadModalRef.value?.init(catalog.value.formats)
  showUploadModal.value = true
}

async function handleUpload(payload) {
  await uploadPhotos(payload, currentFolder.value)
  showUploadModal.value = false
}

// ── Wrappers ──
function handleOpenEdit(photo) {
  openEdit(photo, viewMode.value)
}

function handleBulkDelete() {
  bulkDelete(selectedIds, deselectAll)
}
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

          <template v-if="currentFolder !== null">
            <span class="text-plum/20 text-xs">/</span>
            <button class="text-xs text-plum hover:underline" @click="goBack">Dossiers</button>
            <span class="text-plum/20 text-xs">/</span>
            <span class="text-xs font-semibold text-plum-dark">{{ currentFolderObj?.name }}</span>
          </template>

          <div class="ml-auto flex items-center gap-2">
            <button class="text-[11px] text-plum-muted hover:text-red-500 transition-colors" @click="disconnect">
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

      <template v-if="connected">
        <!-- Folder list -->
        <AdminFolderPanel
          v-if="currentFolder === null"
          :folders="catalog.folders"
          :photos="catalog.photos"
          :loading="loading"
          @open="openFolder"
          @add="handleAddFolder"
          @rename="handleRenameFolder"
          @remove="handleRemoveFolder"
        />

        <!-- Inside a folder -->
        <div v-else>
          <!-- Toolbar -->
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <div class="flex-1 min-w-[160px] max-w-xs">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="admin-input w-full text-xs"
                @keyup.escape="searchQuery = ''"
              />
            </div>

            <p class="text-xs text-plum-muted tabular-nums">
              <template v-if="searchQuery">{{ filteredPhotos.length }} / </template>{{ folderPhotos.length }} photo(s)
            </p>

            <div class="ml-auto flex items-center gap-2">
              <div class="flex bg-plum/5 rounded-md p-0.5">
                <button
                  class="p-1.5 rounded transition-colors"
                  :class="viewMode === 'grid' ? 'bg-white shadow-sm text-plum-dark' : 'text-plum/40 hover:text-plum/60'"
                  aria-label="Vue grille"
                  @click="viewMode = 'grid'"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded transition-colors"
                  :class="viewMode === 'list' ? 'bg-white shadow-sm text-plum-dark' : 'text-plum/40 hover:text-plum/60'"
                  aria-label="Vue liste"
                  @click="viewMode = 'list'"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="2.5" rx="0.5" />
                    <rect x="1" y="6.75" width="14" height="2.5" rx="0.5" />
                    <rect x="1" y="11.5" width="14" height="2.5" rx="0.5" />
                  </svg>
                </button>
              </div>

              <button
                class="px-3 py-1.5 bg-plum text-white rounded-md text-xs font-medium hover:bg-plum-light transition-colors"
                @click="openUploadModal"
              >
                + Ajouter
              </button>
            </div>
          </div>

          <!-- Empty states -->
          <div v-if="!folderPhotos.length" class="text-center text-plum-muted py-16 text-sm">Ce dossier est vide</div>
          <div v-else-if="!filteredPhotos.length" class="text-center text-plum-muted py-16 text-sm">
            Aucune photo pour « {{ searchQuery }} »
          </div>

          <!-- Photo grid/list -->
          <AdminPhotoGrid
            v-else
            v-model:edit-form="editForm"
            :photos="paginatedPhotos"
            :formats="catalog.formats"
            :selected-ids="selectedIds"
            :editing-photo="editingPhoto"
            :view-mode="viewMode"
            :loading="loading"
            @toggle-select="toggleSelect"
            @open-edit="handleOpenEdit"
            @remove="removePhoto"
            @save-edit="saveEdit"
            @cancel-edit="cancelEdit"
          />

          <!-- Load more -->
          <div v-if="hasMore" class="text-center mt-5">
            <button
              class="px-5 py-2 bg-plum/8 text-plum-dark rounded-lg text-xs font-medium hover:bg-plum/15 transition-colors"
              @click="page++"
            >
              Voir plus ({{ filteredPhotos.length - paginatedPhotos.length }} restantes)
            </button>
          </div>

          <!-- Bulk selection bar -->
          <Transition name="toast">
            <div
              v-if="selectionActive"
              class="sticky bottom-4 mt-5 mx-auto max-w-md bg-plum-dark text-white rounded-xl shadow-xl px-5 py-3 flex items-center justify-between gap-4"
            >
              <span class="text-xs font-medium tabular-nums">{{ selectedIds.size }} sélectionnée(s)</span>
              <div class="flex items-center gap-2">
                <button
                  class="text-[11px] text-white/60 hover:text-white transition-colors"
                  @click="selectAll(filteredPhotos.map((p) => p.id))"
                >
                  Tout
                </button>
                <button class="text-[11px] text-white/60 hover:text-white transition-colors" @click="deselectAll">
                  Aucun
                </button>
                <button
                  class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-[11px] font-medium transition-colors"
                  @click="handleBulkDelete"
                >
                  Supprimer ({{ selectedIds.size }})
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </main>

    <!-- Modals -->
    <AdminConnectModal
      :show="showConnectModal"
      :connecting="connecting"
      :error="error"
      @connect="handleConnect"
      @cancel="showConnectModal = false"
    />

    <AdminUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      :folder-name="currentFolderObj?.name || ''"
      :formats="catalog.formats"
      @upload="handleUpload"
      @cancel="showUploadModal = false"
    />

    <AdminEditModal
      :show="editModal.show"
      :photo="editModal.photo"
      :formats="catalog.formats"
      :loading="loading"
      @save="saveEdit"
      @cancel="cancelEdit"
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

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
