<script setup>
import { ref, watch } from 'vue'
import { usePhotos } from '@/composables/usePhotos'

const props = defineProps({
  show: { type: Boolean, default: false },
  photo: { type: Object, default: null },
  formats: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])

const { photoUrl } = usePhotos()
const editForm = ref({ title: '', prices: {} })

watch(
  () => props.photo,
  (photo) => {
    if (photo) {
      editForm.value = { title: photo.title, prices: { ...photo.prices } }
    }
  },
)

function handleSave() {
  emit('save', props.photo, editForm.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('cancel')"
      @keydown.escape="$emit('cancel')"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="edit-modal-title" class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 id="edit-modal-title" class="text-lg font-bold text-plum-dark mb-4">Modifier la photo</h3>

        <img
          v-if="photo"
          :src="photoUrl(photo.src)"
          :alt="photo.title"
          class="w-full max-h-[40vh] object-contain rounded-lg bg-cream-dark mb-4"
        />

        <form class="space-y-3" @submit.prevent="handleSave">
          <div>
            <label class="block text-xs font-medium text-plum-muted mb-1">Titre</label>
            <input v-model="editForm.title" type="text" maxlength="200" class="admin-input w-full" autofocus />
          </div>

          <div>
            <label class="block text-xs font-medium text-plum-muted mb-1">Prix</label>
            <div class="flex gap-3 flex-wrap">
              <div v-for="fmt in formats" :key="fmt.id">
                <label class="block text-[10px] text-plum-muted mb-0.5">{{ fmt.label }}</label>
                <input
                  v-model.number="editForm.prices[fmt.id]"
                  type="number"
                  min="0"
                  step="0.5"
                  class="admin-input w-20"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="px-4 py-2 text-sm text-plum-muted hover:text-plum-dark transition-colors"
              @click="$emit('cancel')"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-5 py-2 bg-plum text-white rounded-lg text-sm font-medium hover:bg-plum-light transition-colors disabled:opacity-50"
            >
              <span v-if="loading" class="spinner mr-1"></span>{{ loading ? 'Sauvegarde' : 'Valider' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
