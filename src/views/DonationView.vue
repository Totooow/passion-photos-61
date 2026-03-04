<script setup>
import { CONTACT_EMAIL } from '@/config'
</script>

<template>
  <section class="max-w-2xl mx-auto px-6 py-16 text-center">
    <h1 class="font-[var(--font-serif)] text-4xl font-bold text-plum-dark mb-6">
      Faire un don
    </h1>
    <p class="text-plum-muted leading-relaxed mb-8">
      Si vous appréciez mon travail et souhaitez me soutenir, vous pouvez faire un don.
      Chaque contribution m'aide à continuer cette passion et à investir dans du matériel
      pour capturer de plus beaux moments.
    </p>
    <a
      :href="`mailto:${CONTACT_EMAIL}?subject=Don%20Passion%20Photos%2061`"
      class="inline-block px-8 py-3 bg-plum text-white rounded-full text-sm tracking-wide hover:bg-plum-light transition-colors"
    >
      Me contacter pour un don
    </a>
  </section>
</template>
