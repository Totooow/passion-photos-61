<script setup>
import { useCart } from '@/composables/useCart'
import { usePhotos } from '@/composables/usePhotos'
import { PREVIEW_DISCLAIMER } from '@/config'
import StripeButton from '@/components/StripeButton.vue'

const { items, total, removeItem, updateQty, clearCart, checkout } = useCart()
const { photoUrl } = usePhotos()
</script>

<template>
  <section class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
    <h1 class="font-serif text-2xl sm:text-4xl font-bold text-plum-dark text-center mb-6 sm:mb-8">Panier</h1>

    <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-16 sm:py-24">
      <!-- Decorative empty cart illustration -->
      <div class="relative mb-8">
        <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-plum/10 flex items-center justify-center">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-dashed border-plum/15 flex items-center justify-center">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 text-plum/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        </div>
        <!-- Small decorative dots -->
        <span class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-plum/15" />
        <span class="absolute bottom-3 left-0 w-1 h-1 rounded-full bg-plum/10" />
      </div>

      <p class="font-serif text-lg sm:text-xl text-plum-dark mb-2">Votre panier est vide</p>
      <p class="text-sm text-plum-muted mb-8 max-w-xs text-center leading-relaxed">
        Parcourez la galerie pour découvrir et sélectionner vos photos préférées.
      </p>

      <RouterLink
        to="/galerie"
        class="group inline-flex items-center gap-2 px-7 py-3 bg-plum text-white rounded-full text-sm tracking-wide hover:bg-plum-light transition-all duration-300 hover:shadow-lg hover:shadow-plum/20"
      >
        Découvrir la galerie
        <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </RouterLink>
    </div>

    <template v-else>
      <div class="space-y-3 sm:space-y-4 mb-8">
        <div
          v-for="item in items"
          :key="item.key"
          class="bg-cream-dark rounded-xl sm:rounded-lg overflow-hidden"
        >
          <!-- Desktop: single row -->
          <div class="hidden sm:flex items-center gap-4 p-3">
            <img :src="photoUrl(item.src)" :alt="item.title" class="w-20 h-14 object-cover rounded" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-plum-dark truncate">{{ item.title }}</p>
              <p class="text-xs text-plum-muted">{{ item.formatLabel }} — {{ item.price }}&nbsp;&euro;</p>
            </div>
            <div v-if="item.formatType === 'print'" class="flex items-center gap-1.5 shrink-0">
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full border border-plum/15 text-plum-muted hover:bg-plum/5 hover:text-plum-dark transition-colors text-xs"
                @click="updateQty(item.key, item.qty - 1)"
              >
                &minus;
              </button>
              <span class="text-sm font-medium text-plum-dark w-6 text-center">{{ item.qty }}</span>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full border border-plum/15 text-plum-muted hover:bg-plum/5 hover:text-plum-dark transition-colors text-xs"
                @click="updateQty(item.key, item.qty + 1)"
              >
                +
              </button>
            </div>
            <p class="text-sm font-medium text-plum-dark shrink-0 w-14 text-right">
              {{ item.price * item.qty }}&nbsp;&euro;
            </p>
            <button
              class="shrink-0 text-plum-muted hover:text-red-600 transition-colors"
              aria-label="Supprimer l'article"
              @click="removeItem(item.key)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>

          <!-- Mobile: compact card layout -->
          <div class="sm:hidden p-3">
            <div class="flex gap-3">
              <img
                :src="photoUrl(item.src)"
                :alt="item.title"
                class="w-[72px] h-[72px] object-cover rounded-lg shrink-0"
              />
              <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <p class="text-sm font-medium text-plum-dark leading-tight truncate">{{ item.title }}</p>
                  <p class="text-xs text-plum-muted mt-0.5">{{ item.formatLabel }}</p>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <!-- Qty controls for print -->
                    <template v-if="item.formatType === 'print'">
                      <div class="flex items-center gap-1">
                        <button
                          class="w-7 h-7 flex items-center justify-center rounded-full border border-plum/15 text-plum-muted active:bg-plum/10 text-xs"
                          @click="updateQty(item.key, item.qty - 1)"
                        >
                          &minus;
                        </button>
                        <span class="text-sm font-medium text-plum-dark w-5 text-center">{{ item.qty }}</span>
                        <button
                          class="w-7 h-7 flex items-center justify-center rounded-full border border-plum/15 text-plum-muted active:bg-plum/10 text-xs"
                          @click="updateQty(item.key, item.qty + 1)"
                        >
                          +
                        </button>
                      </div>
                    </template>
                    <p class="text-sm font-semibold text-plum-dark">{{ item.price * item.qty }}&nbsp;&euro;</p>
                  </div>
                  <button
                    class="text-plum-muted/60 active:text-red-600 transition-colors p-1 -mr-1"
                    aria-label="Supprimer l'article"
                    @click="removeItem(item.key)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-plum-muted mb-4">{{ PREVIEW_DISCLAIMER }}</p>

      <div class="border-t border-plum/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p class="text-sm text-plum-muted">Total</p>
          <p class="text-2xl font-bold text-plum-dark">{{ total }}&nbsp;&euro;</p>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <button class="px-4 py-2 text-sm text-plum-muted hover:text-red-600 transition-colors" @click="clearCart">
            Vider le panier
          </button>
          <StripeButton label="Payer par carte" loading-label="Préparation de la commande…" :action="checkout" />
        </div>
      </div>
    </template>
  </section>
</template>
