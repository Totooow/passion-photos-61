<script setup>
import { usePhotos } from '@/composables/usePhotos'
import { PREVIEW_DISCLAIMER } from '@/config'
import FormatSelector from '@/components/FormatSelector.vue'

defineProps({
  photo: { type: Object, default: null },
})

defineEmits(['close'])

const { photoUrl } = usePhotos()
</script>

<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="photo"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="$emit('close')"
        @keydown.escape="$emit('close')"
      >
        <div role="dialog" aria-modal="true" aria-label="Détail de la photo" class="relative max-w-4xl w-full bg-cream rounded-xl overflow-hidden shadow-2xl">
          <button
            class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            aria-label="Fermer"
            @click="$emit('close')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img :src="photoUrl(photo.src)" :alt="photo.title" class="w-full max-h-[50vh] sm:max-h-[70vh] object-contain bg-black/5" />

          <div class="p-4">
            <p class="text-xs text-plum-muted mb-3">{{ PREVIEW_DISCLAIMER }}</p>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 class="font-serif text-lg font-bold text-plum-dark">{{ photo.title }}</h3>
              <FormatSelector :photo="photo" variant="modal" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
