<script setup>
import { ref, computed, watch } from 'vue'
import { useCart } from '@/composables/useCart'
import { usePhotos } from '@/composables/usePhotos'

const props = defineProps({
  photo: { type: Object, default: null },
})

defineEmits(['close'])

const { addItem, isInCart } = useCart()
const { formats, photoUrl } = usePhotos()

const selectedFormat = ref(formats.value[0]?.id || '10x15')

watch(() => props.photo, () => {
  selectedFormat.value = formats.value[0]?.id || '10x15'
})

const currentPrice = computed(() => props.photo?.prices?.[selectedFormat.value] ?? 0)
const currentFormatLabel = computed(() => formats.value.find((f) => f.id === selectedFormat.value)?.label || selectedFormat.value)
const inCart = computed(() => props.photo ? isInCart(props.photo.id, selectedFormat.value).value : false)

function handleAdd() {
  if (!props.photo) return
  addItem(props.photo, selectedFormat.value, currentFormatLabel.value, currentPrice.value)
}
</script>

<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="photo"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="relative max-w-4xl w-full bg-cream rounded-xl overflow-hidden shadow-2xl">
          <button
            class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            @click="$emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            :src="photoUrl(photo.src)"
            :alt="photo.title"
            class="w-full max-h-[70vh] object-contain bg-black/5"
          />

          <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="font-[var(--font-serif)] text-lg font-bold text-plum-dark">{{ photo.title }}</h3>
              <p class="text-plum-muted text-sm mt-0.5">{{ currentPrice }}&nbsp;&euro;</p>
            </div>
            <div class="flex items-center gap-3">
              <select
                v-model="selectedFormat"
                class="bg-cream-dark text-plum-dark text-sm rounded-lg px-3 py-2 border border-plum/10 outline-none"
              >
                <option
                  v-for="fmt in formats"
                  :key="fmt.id"
                  :value="fmt.id"
                >
                  {{ fmt.label }} — {{ photo.prices?.[fmt.id] }}&euro;
                </option>
              </select>
              <button
                class="shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors"
                :class="inCart ? 'bg-cream-dark text-plum-dark' : 'bg-plum text-white hover:bg-plum-light'"
                @click="handleAdd"
              >
                {{ inCart ? 'Ajouté' : 'Ajouter au panier' }}
              </button>
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
