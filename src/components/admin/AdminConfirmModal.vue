<script setup>
defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('cancel')"
      @keydown.escape="$emit('cancel')"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 id="confirm-modal-title" class="text-lg font-bold text-plum-dark mb-2">Confirmation</h3>
        <p class="text-sm text-plum-muted mb-5">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 text-sm text-plum-muted hover:text-plum-dark transition-colors"
            @click="$emit('cancel')"
          >
            Annuler
          </button>
          <button
            :disabled="loading"
            class="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            @click="$emit('confirm')"
          >
            <span v-if="loading" class="spinner mr-1"></span>{{ loading ? 'Suppression' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
