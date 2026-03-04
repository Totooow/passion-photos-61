<script setup>
import { ref } from 'vue'
import { useCart } from '@/composables/useCart'
import { usePhotos } from '@/composables/usePhotos'

const props = defineProps({
  photo: { type: Object, required: true },
})

defineEmits(['open'])

const { addItem, isInCart } = useCart()
const { formats, photoUrl } = usePhotos()

const selectedFormat = ref(formats.value[0]?.id || '10x15')

function currentPrice() {
  return props.photo.prices?.[selectedFormat.value] ?? 0
}

function currentFormatLabel() {
  return formats.value.find((f) => f.id === selectedFormat.value)?.label || selectedFormat.value
}

function handleAdd() {
  addItem(props.photo, selectedFormat.value, currentFormatLabel(), currentPrice())
}
</script>

<template>
  <div class="group relative overflow-hidden rounded-lg bg-cream-dark">
    <img
      :src="photoUrl(photo.src)"
      :alt="photo.title"
      class="w-full aspect-[4/3] object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
      @click="$emit('open', photo)"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <p class="text-white text-sm font-medium">{{ photo.title }}</p>
      <div class="flex items-center gap-2 mt-1.5">
        <select
          v-model="selectedFormat"
          class="bg-white/20 text-white text-xs rounded px-1.5 py-1 backdrop-blur-sm border border-white/30 outline-none"
          @click.stop
        >
          <option
            v-for="fmt in formats"
            :key="fmt.id"
            :value="fmt.id"
            class="text-plum-dark bg-white"
          >
            {{ fmt.label }} — {{ photo.prices?.[fmt.id] }}&euro;
          </option>
        </select>
        <button
          class="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="isInCart(photo.id, selectedFormat).value ? 'bg-white text-plum' : 'bg-plum text-white hover:bg-plum-light'"
          @click.stop="handleAdd"
        >
          {{ isInCart(photo.id, selectedFormat).value ? 'Ajouté' : 'Ajouter' }}
        </button>
      </div>
    </div>
  </div>
</template>
