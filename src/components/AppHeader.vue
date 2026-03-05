<script setup>
import { ref } from 'vue'
import { useCart } from '@/composables/useCart'
import { NAV_LINKS } from '@/config'

const { itemCount } = useCart()
const menuOpen = ref(false)

const navLinks = NAV_LINKS
</script>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm">
    <nav class="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 flex items-center justify-between">
      <!-- Burger mobile -->
      <button
        class="md:hidden text-plum-dark"
        :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            v-if="!menuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Nav desktop -->
      <div class="hidden md:flex items-center gap-6">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-plum-dark hover:text-plum transition-colors text-sm tracking-wide"
          :class="{ 'underline underline-offset-4': $route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- Logo centré -->
      <RouterLink to="/" class="absolute left-1/2 -translate-x-1/2">
        <img src="/logo.png" alt="Passion Photos 61" class="h-10 md:h-16 w-auto" />
      </RouterLink>

      <!-- Panier -->
      <RouterLink
        to="/panier"
        class="relative flex items-center gap-1 text-plum-dark hover:text-plum transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        <span
          v-if="itemCount > 0"
          class="absolute -top-1 -right-2 bg-plum text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
        >
          {{ itemCount }}
        </span>
      </RouterLink>
    </nav>

    <!-- Menu mobile -->
    <transition name="slide">
      <div
        v-if="menuOpen"
        class="absolute left-0 right-0 top-full md:hidden border-t border-plum/10 bg-white px-4 pb-4 shadow-md"
      >
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block py-2 text-plum-dark hover:text-plum transition-colors text-sm tracking-wide"
          :class="{ 'font-semibold': $route.path === link.to }"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
