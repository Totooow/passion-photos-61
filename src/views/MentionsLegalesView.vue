<script setup>
import { CONTACT_EMAIL } from '@/config'
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-12">
    <h1 class="font-serif text-2xl md:text-3xl font-bold text-plum-dark mb-8">Mentions légales</h1>

    <div class="prose">
      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          Passion Photos 61<br />
          [NOM COMPLET À COMPLÉTER]<br />
          [ADRESSE À COMPLÉTER]<br />
          [SIRET À COMPLÉTER, si applicable]<br />
          Contact : <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
        </p>
      </section>

      <section>
        <h2>2. Directeur de la publication</h2>
        <p>[NOM DU DIRECTEUR DE PUBLICATION À COMPLÉTER]</p>
      </section>

      <section>
        <h2>3. Hébergement</h2>
        <p>
          <strong>Site web :</strong><br />
          Scaleway SAS<br />
          8 rue de la Ville l'Évêque, 75008 Paris, France<br />
          <a href="https://www.scaleway.com" target="_blank" rel="noopener noreferrer">www.scaleway.com</a>
        </p>
        <p>
          <strong>API et fonctions serverless :</strong><br />
          Scaleway SAS — Scaleway Serverless Functions
        </p>
        <p>
          <strong>Stockage des fichiers :</strong><br />
          Scaleway SAS — Scaleway Object Storage (région fr-par)
        </p>
        <p>
          <strong>Paiements :</strong><br />
          Stripe Payments Europe, Ltd.<br />
          1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irlande<br />
          <a href="https://www.stripe.com" target="_blank" rel="noopener noreferrer">www.stripe.com</a>
        </p>
      </section>

      <section>
        <h2>4. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu de ce site (textes, photographies, graphismes, logo, icônes) est la propriété
          exclusive de Passion Photos 61, sauf mention contraire. Toute reproduction, représentation ou diffusion,
          en tout ou partie, du contenu de ce site sur quelque support ou par tout procédé que ce soit est interdite
          sans l'autorisation écrite préalable de Passion Photos 61.
        </p>
      </section>

      <section>
        <h2>5. Données personnelles</h2>
        <p>
          Les données personnelles collectées lors d'une commande (nom, adresse email) sont utilisées
          exclusivement pour le traitement de la commande et ne sont transmises à aucun tiers, à l'exception
          du prestataire de paiement Stripe, nécessaire au traitement de la transaction.
        </p>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit
          d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits,
          contactez-nous à l'adresse <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
        <p>
          Ce site n'utilise pas de cookies de suivi ou de publicité.
        </p>
      </section>

      <section>
        <h2>6. Responsabilité</h2>
        <p>
          Passion Photos 61 s'efforce d'assurer l'exactitude des informations diffusées sur ce site.
          Toutefois, elle ne peut garantir l'exactitude, la complétude et l'actualité de ces informations
          et décline toute responsabilité pour les éventuelles erreurs ou omissions.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Pour toute question relative au site, vous pouvez nous contacter à l'adresse
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.prose h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-plum-dark);
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}
.prose p {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-plum-muted);
  margin-bottom: 0.75rem;
}
.prose a {
  color: var(--color-plum);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.prose a:hover {
  color: var(--color-plum-light);
}
.prose section {
  margin-bottom: 1rem;
}
</style>
