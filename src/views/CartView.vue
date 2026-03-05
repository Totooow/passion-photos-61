<script setup>
import { useCart } from '@/composables/useCart'
import { usePhotos } from '@/composables/usePhotos'
import { PREVIEW_DISCLAIMER } from '@/config'

const { items, total, removeItem, updateQty, clearCart, buildMailto } = useCart()
const { photoUrl } = usePhotos()
</script>

<template>
  <section class="max-w-3xl mx-auto px-6 py-10">
    <h1 class="font-serif text-4xl font-bold text-plum-dark text-center mb-8">Panier</h1>

    <div v-if="items.length === 0" class="text-center text-plum-muted py-20">
      <p class="text-lg mb-4">Votre panier est vide</p>
      <RouterLink
        to="/galerie"
        class="inline-block px-6 py-2 bg-plum text-white rounded-full text-sm hover:bg-plum-light transition-colors"
      >
        Voir la galerie
      </RouterLink>
    </div>

    <template v-else>
      <div class="space-y-4 mb-8">
        <div v-for="item in items" :key="item.key" class="flex items-center gap-4 bg-cream-dark rounded-lg p-3">
          <img :src="photoUrl(item.src)" :alt="item.title" class="w-20 h-14 object-cover rounded" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-plum-dark truncate">{{ item.title }}</p>
            <p class="text-xs text-plum-muted">{{ item.formatLabel }} — {{ item.price }}&nbsp;&euro;</p>
          </div>

          <!-- Qty controls for print formats -->
          <div v-if="item.formatType === 'print'" class="flex items-center gap-1.5 shrink-0">
            <button
              class="w-6 h-6 flex items-center justify-center rounded-full border border-plum/15 text-plum-muted hover:bg-plum/5 hover:text-plum-dark transition-colors text-xs"
              @click="updateQty(item.key, item.qty - 1)"
            >
              &minus;
            </button>
            <span class="text-sm font-medium text-plum-dark w-6 text-center">{{ item.qty }}</span>
            <button
              class="w-6 h-6 flex items-center justify-center rounded-full border border-plum/15 text-plum-muted hover:bg-plum/5 hover:text-plum-dark transition-colors text-xs"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      <p class="text-[11px] text-plum-muted mb-4">{{ PREVIEW_DISCLAIMER }}</p>

      <div
        class="border-t border-plum/10 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p class="text-sm text-plum-muted">Total</p>
          <p class="text-2xl font-bold text-plum-dark">{{ total }}&nbsp;&euro;</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button class="px-4 py-2 text-sm text-plum-muted hover:text-red-600 transition-colors" @click="clearCart">
            Vider le panier
          </button>
          <a
            :href="buildMailto()"
            class="inline-block text-center px-6 py-2.5 bg-plum text-white rounded-full text-sm font-medium hover:bg-plum-light transition-colors"
          >
            Commander par email
          </a>
        </div>
      </div>
    </template>
  </section>
</template>
