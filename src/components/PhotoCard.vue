<script setup>
import { ref } from 'vue'
import { usePhotos } from '@/composables/usePhotos'
import FormatSelector from '@/components/FormatSelector.vue'

defineProps({
  photo: { type: Object, required: true },
})

defineEmits(['open'])

const loaded = ref(false)
const { photoUrl } = usePhotos()
</script>

<template>
  <div class="group relative overflow-hidden rounded-lg bg-cream-dark">
    <div class="relative aspect-[4/3]">
      <div v-if="!loaded" class="absolute inset-0 skeleton" />
      <img
        :src="photoUrl(photo.src)"
        :alt="photo.title"
        class="absolute inset-0 w-full h-full object-cover cursor-pointer transition-all duration-500 group-hover:scale-105"
        :style="{ opacity: loaded ? 1 : 0 }"
        loading="lazy"
        @load="loaded = true"
        @click="$emit('open', photo)"
      />
    </div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    />
    <div
      class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
    >
      <p class="text-white text-sm font-medium">{{ photo.title }}</p>
      <div class="flex items-center gap-2 mt-1.5">
        <FormatSelector :photo="photo" variant="card" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(83, 26, 74, 0.06) 25%,
    rgba(83, 26, 74, 0.12) 50%,
    rgba(83, 26, 74, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
