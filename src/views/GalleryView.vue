<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePhotos } from '@/composables/usePhotos'
import { PREVIEW_DISCLAIMER } from '@/config'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import FolderFilter from '@/components/FolderFilter.vue'
import PhotoCard from '@/components/PhotoCard.vue'
import PhotoModal from '@/components/PhotoModal.vue'

const { folders, loading, error, fetchPhotos, photosByFolder } = usePhotos()

const activeFolder = ref('')
const selectedPhoto = ref(null)

const filteredPhotos = computed(() => photosByFolder(activeFolder.value))

// Responsive columns
const columns = ref(4)
function updateColumns() {
  if (window.innerWidth >= 1024) columns.value = 4
  else if (window.innerWidth >= 640) columns.value = 3
  else columns.value = 2
}

// Group photos into rows
const rows = computed(() => {
  const result = []
  const list = filteredPhotos.value
  for (let i = 0; i < list.length; i += columns.value) {
    result.push(list.slice(i, i + columns.value))
  }
  return result
})

// Estimate row height from window width
const GAP = 16
function estimateRowHeight() {
  const containerWidth = Math.min(window.innerWidth - 48, 1280) // max-w-7xl + px-6
  const colWidth = (containerWidth - GAP * (columns.value - 1)) / columns.value
  return Math.round(colWidth * 0.75) + GAP // aspect 4/3 + gap
}

const listRef = ref(null)

const virtualizer = useWindowVirtualizer(
  computed(() => ({
    count: rows.value.length,
    estimateSize: () => estimateRowHeight(),
    overscan: 5,
    scrollMargin: listRef.value?.offsetTop ?? 0,
  })),
)

function onResize() {
  updateColumns()
  virtualizer.value.measure()
}

onMounted(() => {
  fetchPhotos()
  updateColumns()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => window.removeEventListener('resize', onResize))

// Re-measure when folder or columns change
watch([activeFolder, columns], () => {
  virtualizer.value.measure()
})
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-10">
    <h1 class="font-serif text-4xl font-bold text-plum-dark text-center mb-8">Galerie</h1>

    <div v-if="loading" class="text-center text-plum-muted py-20">Chargement...</div>

    <div v-else-if="error" class="text-center text-red-600 py-20">Erreur : {{ error }}</div>

    <template v-else>
      <FolderFilter
        :folders="folders"
        :active="activeFolder"
        class="mb-8"
        @select="activeFolder = $event"
      />

      <p class="text-center text-xs text-plum-muted mb-6 flex items-center justify-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
        </svg>
        Cliquez sur une photo pour la voir en entier et l'ajouter au panier
      </p>

      <div
        v-if="rows.length"
        ref="listRef"
        :style="{ height: virtualizer.getTotalSize() + 'px', position: 'relative' }"
      >
        <div
          v-for="vRow in virtualizer.getVirtualItems()"
          :key="vRow.index"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: vRow.size + 'px',
            transform: `translateY(${vRow.start - virtualizer.options.scrollMargin}px)`,
          }"
        >
          <div
            class="grid"
            :style="{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              columnGap: GAP + 'px',
            }"
          >
            <PhotoCard
              v-for="photo in rows[vRow.index]"
              :key="photo.id"
              :photo="photo"
              @open="selectedPhoto = $event"
            />
          </div>
        </div>
      </div>

      <p v-if="!filteredPhotos.length" class="text-center text-plum-muted py-20">
        Aucune photo dans cette catégorie.
      </p>
    </template>

    <p class="text-center text-xs text-plum-muted mt-10">{{ PREVIEW_DISCLAIMER }}</p>

    <PhotoModal :photo="selectedPhoto" @close="selectedPhoto = null" />
  </section>
</template>
