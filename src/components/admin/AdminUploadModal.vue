<script setup>
import { ref } from 'vue'
import { DEFAULT_PRICE_MAP } from '@/config'

defineProps({
  show: { type: Boolean, default: false },
  folderName: { type: String, default: '' },
  formats: { type: Array, default: () => [] },
})

const emit = defineEmits(['upload', 'cancel'])

const fileInput = ref(null)
const uploadFiles = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const defaultPrices = ref({})

function init(formats) {
  clearQueue()
  formats.forEach((f) => {
    if (!(f.id in defaultPrices.value)) defaultPrices.value[f.id] = DEFAULT_PRICE_MAP[f.id] ?? 2
  })
}

function close() {
  if (uploading.value) return
  clearQueue()
  emit('cancel')
}

function handleFileDrop(e) {
  e.preventDefault()
  addFilesToQueue(e.dataTransfer.files)
}

function handleFileSelect(e) {
  addFilesToQueue(e.target.files)
  e.target.value = ''
}

function addFilesToQueue(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    uploadFiles.value.push({ file, preview: URL.createObjectURL(file) })
  }
}

function removeFromQueue(i) {
  URL.revokeObjectURL(uploadFiles.value[i].preview)
  uploadFiles.value.splice(i, 1)
}

function clearQueue() {
  uploadFiles.value.forEach((f) => URL.revokeObjectURL(f.preview))
  uploadFiles.value = []
}

function startUpload() {
  if (!uploadFiles.value.length) return
  emit('upload', {
    files: uploadFiles.value,
    defaultPrices: { ...defaultPrices.value },
    onProgress(progress) {
      uploadProgress.value = progress
    },
    onStart() {
      uploading.value = true
    },
    onDone() {
      clearQueue()
      uploading.value = false
      uploadProgress.value = 0
    },
  })
}

defineExpose({ init })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="close"
      @keydown.escape="close"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="upload-modal-title" class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 id="upload-modal-title" class="text-lg font-bold text-plum-dark mb-4">Ajouter des photos dans « {{ folderName }} »</h3>

        <!-- Prix par défaut -->
        <div class="flex gap-3 items-end flex-wrap mb-4">
          <div v-for="fmt in formats" :key="fmt.id">
            <label :for="`price-${fmt.id}`" class="block text-[10px] font-medium text-plum-muted mb-0.5">{{ fmt.label }}</label>
            <input :id="`price-${fmt.id}`" v-model.number="defaultPrices[fmt.id]" type="number" min="0" step="1" class="admin-input w-20" />
          </div>
        </div>

        <!-- Dropzone -->
        <div
          class="border-2 border-dashed border-plum/15 rounded-lg p-6 text-center cursor-pointer hover:border-plum/35 hover:bg-cream/50 transition-colors"
          @click="fileInput.click()"
          @dragover.prevent="$event.currentTarget.classList.add('border-plum/35', 'bg-cream/50')"
          @dragleave="$event.currentTarget.classList.remove('border-plum/35', 'bg-cream/50')"
          @drop.prevent="
            (e) => {
              e.currentTarget.classList.remove('border-plum/35', 'bg-cream/50')
              handleFileDrop(e)
            }
          "
        >
          <p class="text-sm text-plum-dark font-medium">Cliquez ou glissez des images</p>
          <p class="text-xs text-plum-muted mt-0.5">JPG, PNG, WebP</p>
        </div>
        <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFileSelect" />

        <!-- Preview -->
        <div v-if="uploadFiles.length" class="mt-4 space-y-3">
          <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
            <div
              v-for="(item, i) in uploadFiles"
              :key="i"
              class="relative rounded overflow-hidden border border-plum/10"
            >
              <img :src="item.preview" class="w-full h-16 object-cover" />
              <button
                class="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-black/70"
                aria-label="Retirer cette image"
                @click="removeFromQueue(i)"
              >
                &times;
              </button>
            </div>
          </div>

          <div v-if="uploading" class="h-1.5 bg-cream-dark rounded-full overflow-hidden">
            <div class="h-full bg-plum transition-all" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-4">
          <button
            v-if="!uploading"
            type="button"
            class="px-4 py-2 text-sm text-plum-muted hover:text-plum-dark transition-colors"
            @click="close"
          >
            Annuler
          </button>
          <button
            :disabled="uploading || !uploadFiles.length"
            class="px-5 py-2 bg-plum text-white rounded-lg text-sm font-medium hover:bg-plum-light transition-colors disabled:opacity-50"
            @click="startUpload"
          >
            <span v-if="uploading" class="spinner mr-1"></span
            >{{ uploading ? `Upload ${uploadProgress}%` : `Uploader ${uploadFiles.length} photo(s)` }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
