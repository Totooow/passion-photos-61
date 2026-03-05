<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  connecting: { type: Boolean, default: false },
  error: { type: String, default: null },
})

const emit = defineEmits(['connect', 'cancel'])

const apiKeyInput = ref('')
const slowConnect = ref(false)
let slowTimer = null

watch(
  () => props.connecting,
  (val) => {
    clearTimeout(slowTimer)
    slowConnect.value = false
    if (val) {
      slowTimer = setTimeout(() => {
        slowConnect.value = true
      }, 3000)
    }
  },
)

function handleSubmit() {
  emit('connect', apiKeyInput.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="!connecting && $emit('cancel')"
      @keydown.escape="!connecting && $emit('cancel')"
    >
      <div role="dialog" aria-modal="true" aria-labelledby="connect-modal-title" class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 id="connect-modal-title" class="text-lg font-bold text-plum-dark mb-4">Connexion</h3>

        <!-- Loading state -->
        <div v-if="connecting" class="py-6 text-center">
          <span class="spinner text-plum !w-5 !h-5"></span>
          <p class="text-sm text-plum-dark mt-3">Connexion au serveur...</p>
          <p v-if="slowConnect" class="text-xs text-plum-muted mt-2">
            Le serveur se réveille, ça peut prendre quelques secondes.
          </p>
        </div>

        <!-- Form -->
        <form v-else class="space-y-3" @submit.prevent="handleSubmit">
          <div>
            <label for="api-key-input" class="block text-xs font-medium text-plum-muted mb-1">Clé API</label>
            <input id="api-key-input" v-model="apiKeyInput" type="password" class="admin-input w-full" placeholder="Votre clé d'accès" />
          </div>
          <span v-if="error" class="block text-sm text-red-600">{{ error }}</span>
          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="px-4 py-2 text-sm text-plum-muted hover:text-plum-dark transition-colors"
              @click="$emit('cancel')"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!apiKeyInput.trim()"
              class="px-5 py-2 bg-plum text-white rounded-lg text-sm font-medium hover:bg-plum-light transition-colors disabled:opacity-50"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
