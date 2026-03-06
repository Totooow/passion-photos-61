<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  loadingLabel: { type: String, required: true },
  action: { type: Function, required: true },
})

const loading = ref(false)
const error = ref(null)
const slowHint = ref(false)

async function handleClick() {
  loading.value = true
  error.value = null
  slowHint.value = false
  const timer = setTimeout(() => { slowHint.value = true }, 2000)
  try {
    await props.action()
  } catch (e) {
    error.value = e.message
  } finally {
    clearTimeout(timer)
    loading.value = false
    slowHint.value = false
  }
}
</script>

<template>
  <div>
    <button
      :disabled="loading"
      class="group/btn inline-flex items-center justify-center gap-2 px-8 py-3 bg-plum text-white rounded-full text-sm tracking-wide hover:bg-plum-light transition-all duration-300 hover:shadow-lg hover:shadow-plum/20 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="handleClick"
    >
      <span>{{ loading ? loadingLabel : label }}</span>
      <svg v-if="!loading" class="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12,5 19,12 12,19" />
      </svg>
    </button>
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
    <p v-if="slowHint" class="text-plum-muted text-xs mt-2 animate-fade-in">Connexion au serveur de paiement, merci de patienter…</p>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.4s ease forwards;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
