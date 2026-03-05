<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePhotos } from '@/composables/usePhotos'
import { PREVIEW_DISCLAIMER, GALLERY_PER_PAGE } from '@/config'
import FolderFilter from '@/components/FolderFilter.vue'
import PhotoCard from '@/components/PhotoCard.vue'
import PhotoModal from '@/components/PhotoModal.vue'

const { folders, loading, error, fetchPhotos, photosByFolder } = usePhotos()

const activeFolder = ref('')
const selectedPhoto = ref(null)
const page = ref(1)

const filteredPhotos = computed(() => photosByFolder(activeFolder.value))
const totalPages = computed(() => Math.ceil(filteredPhotos.value.length / GALLERY_PER_PAGE))
const paginatedPhotos = computed(() => filteredPhotos.value.slice(0, page.value * GALLERY_PER_PAGE))
const hasMore = computed(() => page.value < totalPages.value)

onMounted(() => {
  fetchPhotos()
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
        @select="
          (v) => {
            activeFolder = v
            page = 1
          }
        "
      />

      <div v-if="filteredPhotos.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <PhotoCard v-for="photo in paginatedPhotos" :key="photo.id" :photo="photo" @open="selectedPhoto = $event" />
      </div>

      <div v-if="hasMore" class="text-center mt-8">
        <button
          class="px-6 py-2.5 bg-plum text-white rounded-full text-sm font-medium hover:bg-plum-light transition-colors"
          @click="page++"
        >
          Voir plus
        </button>
      </div>

      <p v-else-if="!filteredPhotos.length" class="text-center text-plum-muted py-20">
        Aucune photo dans cette catégorie.
      </p>
    </template>

    <p class="text-center text-xs text-plum-muted mt-10">{{ PREVIEW_DISCLAIMER }}</p>

    <PhotoModal :photo="selectedPhoto" @close="selectedPhoto = null" />
  </section>
</template>
