<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'

const route = useRoute()
const router = useRouter()
const { clearCart } = useCart()

onMounted(() => {
  if (!route.query.session_id) {
    router.replace('/')
    return
  }
  clearCart()
})
</script>

<template>
  <section class="max-w-xl mx-auto px-6 py-20 text-center">
    <div class="text-5xl mb-6">&#10003;</div>
    <h1 class="font-serif text-3xl font-bold text-plum-dark mb-4">Merci pour votre commande !</h1>
    <p class="text-plum-muted mb-8">
      Votre paiement a bien été enregistré. Vous recevrez un email de confirmation.
    </p>
    <RouterLink
      to="/galerie"
      class="inline-block px-6 py-2.5 bg-plum text-white rounded-full text-sm font-medium hover:bg-plum-light transition-colors"
    >
      Retour à la galerie
    </RouterLink>
  </section>
</template>
