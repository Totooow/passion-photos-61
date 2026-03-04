<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePhotos } from '@/composables/usePhotos'
import FolderFilter from '@/components/FolderFilter.vue'
import PhotoCard from '@/components/PhotoCard.vue'
import PhotoModal from '@/components/PhotoModal.vue'

const { photos, folders, loading, error, fetchPhotos, photosByFolder } = usePhotos()

const activeFolder = ref('')
const selectedPhoto = ref(null)

const filteredPhotos = computed(() => photosByFolder(activeFolder.value))

onMounted(() => {
  fetchPhotos()
})
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-10">
    <h1 class="font-[var(--font-serif)] text-4xl font-bold text-plum-dark text-center mb-8">
      Galerie
    </h1>

    <div v-if="loading" class="text-center text-plum-muted py-20">
      Chargement...
    </div>

    <div v-else-if="error" class="text-center text-red-600 py-20">
      Erreur : {{ error }}
    </div>

    <template v-else>
      <FolderFilter
        :folders="folders"
        :active="activeFolder"
        class="mb-8"
        @select="activeFolder = $event"
      />

      <div
        v-if="filteredPhotos.length"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <PhotoCard
          v-for="photo in filteredPhotos"
          :key="photo.id"
          :photo="photo"
          @open="selectedPhoto = $event"
        />
      </div>

      <p v-else class="text-center text-plum-muted py-20">
        Aucune photo dans cette catégorie.
      </p>
    </template>

    <PhotoModal :photo="selectedPhoto" @close="selectedPhoto = null" />
  </section>
</template>
