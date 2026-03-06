<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdmin } from '@/composables/useAdmin'
import { useSearchPagination } from '@/composables/useSearchPagination'
import { useSelection } from '@/composables/useSelection'
import { useAdminUpload } from '@/composables/useAdminUpload'
import { useConfirm } from '@/composables/useConfirm'
import { useAdminPhotos } from '@/composables/useAdminPhotos'
import { ADMIN_PER_PAGE } from '@/config'

import AdminPhotoGrid from '@/components/admin/AdminPhotoGrid.vue'
import AdminUploadModal from '@/components/admin/AdminUploadModal.vue'
import AdminEditModal from '@/components/admin/AdminEditModal.vue'

const route = useRoute()
const router = useRouter()
const { catalog } = useAdmin()
const { loading } = useConfirm()
const { editingPhoto, editForm, editModal, openEdit, saveEdit, cancelEdit, removePhoto, bulkDelete } = useAdminPhotos()
const { uploadPhotos } = useAdminUpload()
const { selectedIds, selectionActive, toggle: toggleSelect, selectAll, deselectAll } = useSelection()

const folderId = computed(() => route.params.folderId)
const folderObj = computed(() => catalog.value.folders.find((f) => f.id === folderId.value))
const folderPhotos = computed(() => catalog.value.photos.filter((p) => p.folder === folderId.value))

const { searchQuery, page, filtered: filteredPhotos, paginated: paginatedPhotos, hasMore } =
  useSearchPagination(folderPhotos, ADMIN_PER_PAGE)

const viewMode = ref('grid')

// ── Upload ──
const showUploadModal = ref(false)
const uploadModalRef = ref(null)

function openUploadModal() {
  uploadModalRef.value?.init(catalog.value.formats)
  showUploadModal.value = true
}

async function handleUpload(payload) {
  await uploadPhotos(payload, folderId.value)
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
  <div>
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
    <Transition name="slide-up">
      <div
        v-if="selectionActive"
        class="sticky bottom-4 mt-5 mx-auto max-w-md bg-plum-dark text-white rounded-xl shadow-xl px-5 py-3 flex items-center justify-between gap-4"
      >
        <span class="text-xs font-medium tabular-nums">{{ selectedIds.size }} sélectionnée(s)</span>
        <div class="flex items-center gap-2">
          <button
            class="text-xs text-white/60 hover:text-white transition-colors"
            @click="selectAll(filteredPhotos.map((p) => p.id))"
          >
            Tout
          </button>
          <button class="text-xs text-white/60 hover:text-white transition-colors" @click="deselectAll">
            Aucun
          </button>
          <button
            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-colors"
            @click="handleBulkDelete"
          >
            Supprimer ({{ selectedIds.size }})
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modals -->
    <AdminUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      :folder-name="folderObj?.name || ''"
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
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
