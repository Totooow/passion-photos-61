<script setup>
import { BMAC_URL } from '@/config'

const contributions = [
  {
    title: 'Matériel',
    description: 'Objectifs et accessoires pour repousser les limites créatives.',
    icon: 'lens',
  },
  {
    title: 'Déplacements',
    description: 'Me déplacer lors de vos événements et séances photo.',
    icon: 'compass',
  },
  {
    title: 'Formation',
    description: "Du temps pour perfectionner l'art de la photographie.",
    icon: 'clock',
  },
]
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
        Si mes images vous touchent, votre soutien me permet de continuer à créer.
      </p>

      <!-- Cards -->
      <div class="grid grid-cols-3 gap-3 max-w-xl w-full mt-8 animate-item" style="--delay: 3">
        <article
          v-for="item in contributions"
          :key="item.title"
          class="group bg-white/60 border border-plum/[0.06] rounded-xl p-4 text-center hover:bg-white/90 hover:border-plum/10 transition-all duration-500"
        >
          <div class="w-9 h-9 mx-auto mb-3 rounded-full bg-plum/[0.04] flex items-center justify-center group-hover:bg-plum/[0.08] transition-colors duration-500">
            <svg v-if="item.icon === 'lens'" class="w-4 h-4 text-plum/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2.5" />
              <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
            </svg>
            <svg v-if="item.icon === 'compass'" class="w-4 h-4 text-plum/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" opacity="0.15" stroke="currentColor" />
            </svg>
            <svg v-if="item.icon === 'clock'" class="w-4 h-4 text-plum/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <h3 class="font-serif text-sm font-semibold text-plum-dark mb-1">{{ item.title }}</h3>
          <p class="text-xs text-plum-muted leading-relaxed">{{ item.description }}</p>
        </article>
      </div>

      <!-- CTA -->
      <a
        :href="BMAC_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="group/btn inline-flex items-center gap-2 mt-8 px-8 py-3 bg-plum text-white rounded-full text-sm tracking-wide hover:bg-plum-light transition-all duration-300 hover:shadow-lg hover:shadow-plum/20 animate-item"
        style="--delay: 4"
      >
        <span>M'offrir un café</span>
        <svg class="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12,5 19,12 12,19" />
        </svg>
      </a>
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
