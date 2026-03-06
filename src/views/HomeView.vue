<template>
  <div class="home">
    <!-- Hero -->
    <section class="relative h-[calc(100svh-8rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
      <div class="relative z-10 text-center">
        <p class="hero-reveal text-xs sm:text-sm tracking-[0.35em] uppercase text-plum-muted mb-4 sm:mb-6" style="animation-delay: 0.1s">
          Photographe Amatrice
        </p>

        <h1 class="hero-reveal font-serif text-[2.5rem] sm:text-6xl md:text-7xl lg:text-8xl font-black text-plum-dark leading-[0.95] tracking-tight" style="animation-delay: 0.25s">
          Passion<br />Photos
          <span class="font-light italic text-plum">61</span>
        </h1>

        <div class="hero-reveal flex items-center justify-center gap-4 mt-6 sm:mt-8" style="animation-delay: 0.45s">
          <span class="h-px w-10 sm:w-16 bg-plum/30" />
          <span class="text-plum-muted text-[10px] sm:text-xs tracking-[0.3em] uppercase">Orne &middot; Normandie</span>
          <span class="h-px w-10 sm:w-16 bg-plum/30" />
        </div>

        <div class="hero-reveal mt-8 sm:mt-10" style="animation-delay: 0.6s">
          <RouterLink
            to="/galerie"
            class="group inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 bg-plum text-white rounded-full text-sm tracking-wide hover:bg-plum-light transition-all duration-300 hover:shadow-lg hover:shadow-plum/20"
          >
            Découvrir la galerie
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </RouterLink>
        </div>

        <!-- Trust badges -->
        <div class="hero-reveal flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-8 text-plum-muted text-[11px] sm:text-xs tracking-wide" style="animation-delay: 0.75s">
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Paiement sécurisé par <span class="font-bold text-[#635BFF]">Stripe</span>
          </span>
          <span class="text-plum/20">&middot;</span>
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7" />
            </svg>
            Hébergé en France
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-reveal {
  opacity: 0;
  transform: translateY(1.25rem);
  animation: reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
