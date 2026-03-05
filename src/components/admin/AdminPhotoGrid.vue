<script setup>
import { usePhotos } from '@/composables/usePhotos'

const props = defineProps({
  photos: { type: Array, required: true },
  formats: { type: Array, required: true },
  selectedIds: { type: Set, required: true },
  editingPhoto: { type: [String, null], default: null },
  viewMode: { type: String, default: 'grid' },
  loading: { type: Boolean, default: false },
})

const editForm = defineModel('editForm', { type: Object, default: () => ({}) })

defineEmits(['toggle-select', 'open-edit', 'remove', 'save-edit', 'cancel-edit'])

const { photoUrl } = usePhotos()

function formatPrices(photo) {
  return props.formats.map((f) => `${f.label}: ${photo.prices?.[f.id] ?? '?'}€`).join(' · ')
}
</script>

<template>
  <!-- GRID VIEW -->
  <div v-if="viewMode === 'grid'" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
    <div
      v-for="photo in photos"
      :key="photo.id"
      class="group relative bg-white rounded-lg border border-plum/8 overflow-hidden hover:border-plum/20 transition-colors"
    >
      <input
        type="checkbox"
        :checked="selectedIds.has(photo.id)"
        class="absolute top-2 left-2 z-10 w-4 h-4 rounded border-plum/20 text-plum accent-plum cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        :class="{ '!opacity-100': selectedIds.has(photo.id) }"
        @change="$emit('toggle-select', photo.id)"
      />

      <img
        :src="photoUrl(photo.src)"
        :alt="photo.title"
        class="w-full aspect-[4/3] object-cover bg-cream-dark"
        loading="lazy"
      />

      <div class="p-2">
        <p class="text-xs font-medium text-plum-dark truncate leading-tight">{{ photo.title }}</p>
        <p class="text-[10px] text-plum-muted mt-0.5 truncate">
          {{ formatPrices(photo) }}
        </p>
      </div>

      <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          class="w-8 h-8 bg-white/90 backdrop-blur rounded-md flex items-center justify-center text-plum/50 hover:text-plum-dark shadow-sm transition-colors"
          aria-label="Modifier"
          @click="$emit('open-edit', photo)"
        >
          <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <path
              d="M11.5 1.5L14.5 4.5M1.5 11.5L1 15L4.5 14.5L13.5 5.5L10.5 2.5L1.5 11.5Z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          class="w-8 h-8 bg-white/90 backdrop-blur rounded-md flex items-center justify-center text-plum/50 hover:text-red-600 shadow-sm transition-colors"
          aria-label="Supprimer"
          @click="$emit('remove', photo)"
        >
          <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4H14M5.5 4V2.5H10.5V4M6 7V12M10 7V12M3.5 4L4.5 14H11.5L12.5 4"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- LIST VIEW -->
  <div v-else class="grid gap-2">
    <div
      v-for="photo in photos"
      :key="photo.id"
      class="group flex items-center gap-3 bg-white rounded-lg border border-plum/8 p-2.5"
    >
      <input
        type="checkbox"
        :checked="selectedIds.has(photo.id)"
        class="w-4 h-4 rounded border-plum/20 text-plum accent-plum cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        :class="{ '!opacity-100': selectedIds.has(photo.id) }"
        @change="$emit('toggle-select', photo.id)"
      />

      <img
        :src="photoUrl(photo.src)"
        :alt="photo.title"
        class="w-16 h-12 object-cover rounded flex-shrink-0 bg-cream-dark"
        loading="lazy"
      />

      <template v-if="editingPhoto !== photo.id">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-plum-dark truncate leading-tight">{{ photo.title }}</p>
          <p class="text-xs text-plum-muted mt-0.5">
            {{ formatPrices(photo) }}
          </p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button
            class="px-2 py-1 text-xs text-plum-muted hover:text-plum-dark hover:bg-plum/5 rounded transition-colors"
            @click="$emit('open-edit', photo)"
          >
            Modifier
          </button>
          <button
            class="px-2 py-1 text-xs text-plum-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            @click="$emit('remove', photo)"
          >
            Supprimer
          </button>
        </div>
      </template>

      <template v-else>
        <div class="flex-1 space-y-1.5">
          <input
            v-model="editForm.title"
            type="text"
            class="admin-input w-full text-sm"
            @keyup.enter="$emit('save-edit', photo)"
          />
          <div class="flex gap-2 flex-wrap items-center">
            <div v-for="fmt in formats" :key="fmt.id" class="flex items-center gap-1">
              <span class="text-[10px] text-plum-muted">{{ fmt.label }}</span>
              <input v-model.number="editForm.prices[fmt.id]" type="number" min="0" class="admin-input w-14 text-xs" />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              :disabled="loading"
              class="px-2 py-0.5 text-xs font-medium text-white bg-plum rounded hover:bg-plum-light transition-colors disabled:opacity-50"
              @click="$emit('save-edit', photo)"
            >
              <span v-if="loading" class="spinner mr-1"></span>{{ loading ? 'Sauvegarde' : 'Valider' }}
            </button>
            <button
              class="px-2 py-0.5 text-xs text-plum-muted hover:text-plum-dark transition-colors"
              @click="$emit('cancel-edit')"
            >
              Annuler
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
