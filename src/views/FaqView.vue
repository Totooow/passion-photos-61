<script setup>
import { ref } from 'vue'

const faqItems = [
  {
    question: 'Dans quels formats sont disponibles les photos\u00a0?',
    answer: 'Trois options sont proposées\u00a0: le tirage 10×15\u00a0cm, le tirage 13×18\u00a0cm, et la version numérique en pleine résolution envoyée par e-mail.'
  },
  {
    question: 'Comment se passe la livraison\u00a0?',
    answer: 'Les photos numériques vous sont envoyées directement par e-mail après validation du paiement. Pour les tirages physiques, la remise se fait en main propre dans le secteur de l\'Orne.'
  },
  {
    question: 'Pourquoi les photos ont un filigrane\u00a0?',
    answer: 'Les aperçus affichés sur le site sont volontairement en qualité réduite et filigranés pour protéger mon travail. La photo que vous recevrez après achat sera en pleine résolution et sans filigrane.'
  },
  {
    question: 'Le paiement est-il sécurisé\u00a0?',
    answer: 'Oui, tous les paiements sont traités par Stripe, un leader mondial du paiement en ligne. Vos informations bancaires ne transitent jamais par notre site.'
  },
  {
    question: 'Puis-je utiliser les photos pour un usage commercial\u00a0?',
    answer: 'Les tirages sont destinés à un usage personnel uniquement. Pour toute demande d\'utilisation commerciale ou de collaboration, n\'hésitez pas à me contacter directement.'
  }
]

const openIndex = ref(0)

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="py-12 sm:py-20">
    <div class="max-w-2xl mx-auto px-6">
      <div class="flex items-center justify-center gap-4 mb-10 sm:mb-14">
        <span class="h-px w-8 sm:w-12 bg-plum/20" />
        <h1 class="font-serif text-xl sm:text-2xl text-plum-dark tracking-tight">Questions fréquentes</h1>
        <span class="h-px w-8 sm:w-12 bg-plum/20" />
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, i) in faqItems"
          :key="i"
          class="border border-plum/10 rounded-xl overflow-hidden transition-colors duration-200"
          :class="openIndex === i ? 'bg-white' : 'bg-white/50 hover:bg-white/80'"
        >
          <button
            class="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left cursor-pointer"
            @click="toggle(i)"
            :aria-expanded="openIndex === i"
          >
            <span class="text-sm sm:text-[0.938rem] text-plum-dark font-medium leading-snug">{{ item.question }}</span>
            <svg
              class="w-4 h-4 shrink-0 text-plum-muted transition-transform duration-300"
              :class="{ 'rotate-45': openIndex === i }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <transition name="faq">
            <div v-show="openIndex === i" class="px-5 sm:px-6 pb-5">
              <p class="text-sm text-plum-muted leading-relaxed">{{ item.answer }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}
.faq-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.faq-enter-to,
.faq-leave-from {
  opacity: 1;
  max-height: 10rem;
}
</style>
