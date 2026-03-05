<script setup>
import { ref, toRef, watch } from 'vue'
import { useCart } from '@/composables/useCart'
import { usePhotos } from '@/composables/usePhotos'
import { usePhotoFormat } from '@/composables/usePhotoFormat'

const props = defineProps({
  photo: { type: Object, required: true },
  variant: { type: String, default: 'card' },
})

const { addItem, isInCart, getQty } = useCart()
const { formats } = usePhotos()

const selectedFormat = ref(formats.value[0]?.id || '')
const { currentPrice, currentFormatLabel, currentFormatType } = usePhotoFormat(toRef(props, 'photo'), selectedFormat)

watch(
  () => props.photo,
  () => {
    selectedFormat.value = formats.value[0]?.id || ''
  },
)

const inCart = () => isInCart(props.photo.id, selectedFormat.value)
const qty = () => getQty(props.photo.id, selectedFormat.value)

function handleAdd() {
  addItem(props.photo, selectedFormat.value, currentFormatLabel.value, currentPrice.value, currentFormatType.value)
}
</script>

<template>
  <!-- Card variant (compact, overlay style) -->
  <template v-if="variant === 'card'">
    <select
      v-model="selectedFormat"
      class="bg-white/20 text-white text-xs rounded px-1.5 py-1 backdrop-blur-sm border border-white/30 outline-none"
      @click.stop
    >
      <option v-for="fmt in formats" :key="fmt.id" :value="fmt.id" class="text-plum-dark bg-white">
        {{ fmt.label }} — {{ photo.prices?.[fmt.id] }}&euro;
      </option>
    </select>
    <button
      v-if="currentFormatType === 'digital' && inCart()"
      class="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-white text-plum"
      disabled
      @click.stop
    >
      Ajouté
    </button>
    <button
      v-else
      class="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors bg-plum text-white hover:bg-plum-light"
      @click.stop="handleAdd"
    >
      {{ qty() > 0 ? `Ajouter (${qty()})` : 'Ajouter' }}
    </button>
  </template>

  <!-- Modal variant (larger, on cream background) -->
  <div v-else class="flex items-center gap-3">
    <p class="text-plum-muted text-sm mr-1">{{ currentPrice }}&nbsp;&euro;</p>
    <select
      v-model="selectedFormat"
      class="bg-cream-dark text-plum-dark text-sm rounded-lg px-3 py-2 border border-plum/10 outline-none"
    >
      <option v-for="fmt in formats" :key="fmt.id" :value="fmt.id">
        {{ fmt.label }} — {{ photo.prices?.[fmt.id] }}&euro;
      </option>
    </select>
    <button
      v-if="currentFormatType === 'digital' && inCart()"
      class="shrink-0 px-5 py-2 rounded-full text-sm font-medium bg-cream-dark text-plum-dark"
      disabled
    >
      Ajouté
    </button>
    <button
      v-else
      class="shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors bg-plum text-white hover:bg-plum-light"
      @click="handleAdd"
    >
      {{ qty() > 0 ? `Ajouter (${qty()} dans le panier)` : 'Ajouter au panier' }}
    </button>
  </div>
</template>
