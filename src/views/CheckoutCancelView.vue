<template>
  <section class="max-w-xl mx-auto px-6 py-20 text-center">
    <h1 class="font-serif text-3xl font-bold text-plum-dark mb-4">Paiement annulé</h1>
    <p class="text-plum-muted mb-8">
      Votre panier a été conservé. Vous pouvez reprendre la commande quand vous le souhaitez.
    </p>
    <RouterLink
      to="/panier"
      class="inline-block px-6 py-2.5 bg-plum text-white rounded-full text-sm font-medium hover:bg-plum-light transition-colors"
    >
      Retour au panier
    </RouterLink>
  </section>
</template>
