<script setup>
import { ref } from 'vue'
import { API_URL } from '@/config'
import StripeButton from '@/components/StripeButton.vue'

const contributions = [
  {
    title: 'Matériel',
    description: 'Objectifs et accessoires pour améliorer la qualité des photos.',
    icon: 'lens',
  },
  {
    title: 'Déplacements',
    description: 'Me déplacer lors de vos événements et séances photo.',
    icon: 'compass',
  },
  {
    title: 'Formation',
    description: "Du temps pour me perfectionner et faire vivre ce site.",
    icon: 'clock',
  },
]

const presets = [2, 5, 10]
const selectedPreset = ref(5)
const customAmount = ref('')
const useCustom = ref(false)

function selectPreset(value) {
  selectedPreset.value = value
  useCustom.value = false
  customAmount.value = ''
}

function selectCustom() {
  useCustom.value = true
  selectedPreset.value = null
}

function amountInCents() {
  if (useCustom.value) {
    const n = parseFloat(customAmount.value)
    if (isNaN(n) || n < 1 || n > 1000) return null
    return Math.round(n * 100)
  }
  return selectedPreset.value * 100
}

async function donate() {
  const cents = amountInCents()
  if (!cents) throw new Error('Montant invalide (entre 1€ et 1000€)')

  const res = await fetch(`${API_URL}/donate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: cents }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erreur ${res.status}`)
  }

  const { url } = await res.json()
  window.location.href = url
}
</script>

<template>
  <div class="donation-page min-h-[calc(100vh-9rem)] flex flex-col">
    <section class="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center relative overflow-hidden">
      <!-- Background circles -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
        <svg class="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="300" r="250" stroke="var(--color-plum)" stroke-width="0.5" />
          <circle cx="400" cy="300" r="200" stroke="var(--color-plum)" stroke-width="0.5" />
          <circle cx="400" cy="300" r="150" stroke="var(--color-plum)" stroke-width="0.5" />
        </svg>
      </div>

      <!-- Title -->
      <p class="text-plum-muted text-xs tracking-[0.3em] uppercase mb-4 animate-item" style="--delay: 0">Soutenir</p>
      <h1 class="font-serif text-3xl md:text-4xl font-bold text-plum-dark tracking-tight animate-item" style="--delay: 1">
        Chaque geste compte
      </h1>
      <p class="max-w-md mx-auto text-plum-muted text-sm leading-relaxed mt-4 animate-item" style="--delay: 2">
        Si vous appréciez mon travail, votre soutien me permet de continuer à créer.
      </p>

      <!-- Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-8 animate-item" style="--delay: 3">
        <article
          v-for="item in contributions"
          :key="item.title"
          class="group bg-white/60 border border-plum/[0.06] rounded-xl p-6 text-center hover:bg-white/90 hover:border-plum/10 transition-all duration-500"
        >
          <div class="w-11 h-11 mx-auto mb-3 rounded-full bg-plum/[0.04] flex items-center justify-center group-hover:bg-plum/[0.08] transition-colors duration-500">
            <svg v-if="item.icon === 'lens'" class="w-5 h-5 text-plum/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2.5" />
              <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
            </svg>
            <svg v-if="item.icon === 'compass'" class="w-5 h-5 text-plum/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" opacity="0.15" stroke="currentColor" />
            </svg>
            <svg v-if="item.icon === 'clock'" class="w-5 h-5 text-plum/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <h3 class="font-serif text-base font-semibold text-plum-dark mb-1">{{ item.title }}</h3>
          <p class="text-sm text-plum-muted leading-relaxed">{{ item.description }}</p>
        </article>
      </div>

      <!-- Amount selector -->
      <div class="mt-8 animate-item" style="--delay: 4">
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <button
            v-for="amount in presets"
            :key="amount"
            @click="selectPreset(amount)"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border',
              selectedPreset === amount && !useCustom
                ? 'bg-plum text-white border-plum shadow-md shadow-plum/20'
                : 'bg-white/60 text-plum-dark border-plum/10 hover:border-plum/25 hover:bg-white/90',
            ]"
          >
            {{ amount }}&nbsp;&euro;
          </button>
          <button
            @click="selectCustom"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border',
              useCustom
                ? 'bg-plum text-white border-plum shadow-md shadow-plum/20'
                : 'bg-white/60 text-plum-dark border-plum/10 hover:border-plum/25 hover:bg-white/90',
            ]"
          >
            Autre
          </button>
        </div>

        <!-- Custom amount input -->
        <div v-if="useCustom" class="mt-4 flex items-center justify-center gap-2">
          <div class="relative">
            <input
              v-model="customAmount"
              type="number"
              min="1"
              max="1000"
              step="0.5"
              placeholder="Montant"
              class="w-28 pl-3 pr-8 py-2 rounded-lg border border-plum/15 bg-white/80 text-plum-dark text-sm text-center focus:outline-none focus:border-plum/40 focus:ring-1 focus:ring-plum/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-plum-muted text-sm">&euro;</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-6 animate-item" style="--delay: 5">
        <StripeButton label="Faire un don" loading-label="Redirection…" :action="donate" />
      </div>

      <!-- Stripe badge -->
      <p class="mt-4 text-plum-muted/50 text-[11px] tracking-wide animate-item" style="--delay: 6">
        Paiement sécurisé par <span class="font-bold text-[#635BFF]">Stripe</span>
      </p>
    </section>

    <!-- Wave -->
    <svg
      class="w-full h-24 text-plum shrink-0"
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30" stroke="currentColor" stroke-width="2" fill="none" opacity="0.15" />
      <path d="M0 40C360 10 720 50 1080 20C1260 8 1380 30 1440 25" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.08" />
    </svg>
  </div>
</template>

<style scoped>
.animate-item {
  opacity: 0;
  transform: translateY(12px);
  animation: reveal 0.6s ease forwards;
  animation-delay: calc(var(--delay, 0) * 0.1s);
}

@keyframes reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
