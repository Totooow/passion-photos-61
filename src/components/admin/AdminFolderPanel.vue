<script setup>
import { ref } from 'vue'

const props = defineProps({
  folders: { type: Array, required: true },
  photos: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'add', 'rename', 'remove'])

const showFolderModal = ref(false)
const newFolderName = ref('')
const renameModal = ref({ show: false, folderId: null, name: '' })

function getPhotoCount(folderId) {
  return props.photos.filter((p) => p.folder === folderId).length
}

function openFolderModal() {
  newFolderName.value = ''
  showFolderModal.value = true
}

function submitAdd() {
  const name = newFolderName.value.trim()
  if (!name) return
  emit('add', name)
  showFolderModal.value = false
}

function openRenameModal(folder) {
  renameModal.value = { show: true, folderId: folder.id, name: folder.name }
}

function submitRename() {
  const name = renameModal.value.name.trim()
  if (!name || !renameModal.value.folderId) {
    renameModal.value.show = false
    return
  }
  emit('rename', renameModal.value.folderId, name)
  renameModal.value.show = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-bold text-plum-dark uppercase tracking-wide">Dossiers</h2>
      <button
        class="px-3 py-1.5 bg-plum text-white rounded-md text-xs font-medium hover:bg-plum-light transition-colors"
        @click="openFolderModal"
      >
        + Nouveau
      </button>
    </div>

    <div v-if="!folders.length" class="text-center text-plum-muted py-16 text-sm">Aucun dossier</div>

    <div class="grid gap-2">
      <div
        v-for="folder in folders"
        :key="folder.id"
        class="group flex items-center bg-white rounded-lg border border-plum/8 hover:border-plum/20 transition-colors cursor-pointer"
        @click="$emit('open', folder.id)"
      >
        <div class="flex-1 flex items-center gap-3 px-4 py-3">
          <div class="w-8 h-8 rounded-md bg-plum/5 flex items-center justify-center text-plum/40 text-sm shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1.5 3.5C1.5 2.95 1.95 2.5 2.5 2.5H6L7.5 4H13.5C14.05 4 14.5 4.45 14.5 5V12.5C14.5 13.05 14.05 13.5 13.5 13.5H2.5C1.95 13.5 1.5 13.05 1.5 12.5V3.5Z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-plum-dark leading-tight">{{ folder.name }}</p>
            <p class="text-[11px] text-plum-muted">{{ getPhotoCount(folder.id) }} photo(s)</p>
          </div>
        </div>
        <div class="flex gap-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="px-2 py-1 text-[11px] text-plum-muted hover:text-plum-dark hover:bg-plum/5 rounded transition-colors"
            @click.stop="openRenameModal(folder)"
          >
            Renommer
          </button>
          <button
            class="px-2 py-1 text-[11px] text-plum-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            @click.stop="$emit('remove', folder)"
          >
            Supprimer
          </button>
        </div>
        <div class="pr-3 text-plum/20 group-hover:text-plum/40 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 3L9 7L5 11"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Modale : Nouveau dossier -->
    <Teleport to="body">
      <div
        v-if="showFolderModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showFolderModal = false"
        @keydown.escape="showFolderModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <h3 class="text-lg font-bold text-plum-dark mb-4">Nouveau dossier</h3>
          <form @submit.prevent="submitAdd">
            <label class="block text-xs font-medium text-plum-muted mb-1">Nom du dossier</label>
            <input
              v-model="newFolderName"
              type="text"
              maxlength="100"
              class="admin-input w-full mb-4"
              placeholder="Ex: Chevaux"
              autofocus
            />
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 text-sm text-plum-muted hover:text-plum-dark transition-colors"
                @click="showFolderModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-5 py-2 bg-plum text-white rounded-lg text-sm font-medium hover:bg-plum-light transition-colors disabled:opacity-50"
              >
                <span v-if="loading" class="spinner mr-1"></span>{{ loading ? 'Création' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modale : Renommer dossier -->
    <Teleport to="body">
      <div
        v-if="renameModal.show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="renameModal.show = false"
        @keydown.escape="renameModal.show = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
          <h3 class="text-lg font-bold text-plum-dark mb-4">Renommer le dossier</h3>
          <form @submit.prevent="submitRename">
            <label class="block text-xs font-medium text-plum-muted mb-1">Nouveau nom</label>
            <input v-model="renameModal.name" type="text" maxlength="100" class="admin-input w-full mb-4" autofocus />
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 text-sm text-plum-muted hover:text-plum-dark transition-colors"
                @click="renameModal.show = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-5 py-2 bg-plum text-white rounded-lg text-sm font-medium hover:bg-plum-light transition-colors disabled:opacity-50"
              >
                <span v-if="loading" class="spinner mr-1"></span>{{ loading ? 'Renommage' : 'Renommer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
