<script setup>
import { CONTACT_EMAIL } from '@/config'
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-12">
    <h1 class="font-serif text-2xl md:text-3xl font-bold text-plum-dark mb-8">Conditions Générales de Vente</h1>

    <div class="prose">
      <section>
        <h2>1. Identité du vendeur</h2>
        <p>
          Passion Photos 61<br />
          [NOM COMPLET À COMPLÉTER]<br />
          [ADRESSE À COMPLÉTER]<br />
          [SIRET À COMPLÉTER, si applicable]<br />
          Contact : <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>
        </p>
      </section>

      <section>
        <h2>2. Objet</h2>
        <p>
          Les présentes conditions générales de vente régissent la vente de photographies proposées sur le site
          Passion Photos 61, sous forme de fichiers numériques et/ou de tirages imprimés.
        </p>
      </section>

      <section>
        <h2>3. Prix et paiement</h2>
        <p>
          Les prix sont indiqués en euros (EUR) toutes taxes comprises. Le paiement est effectué de manière sécurisée
          par carte bancaire via la plateforme Stripe. La commande est confirmée après acceptation du paiement.
        </p>
      </section>

      <section>
        <h2>4. Livraison</h2>
        <p>
          <strong>Photos numériques :</strong> les fichiers sont envoyés par email après confirmation du paiement.
        </p>
        <p>
          <strong>Tirages imprimés :</strong> les tirages sont remis en main propre. Les modalités de remise
          sont convenues directement avec l'acheteur après la commande.
        </p>
      </section>

      <section>
        <h2>5. Droit de rétractation</h2>
        <p>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé
          pour les contrats de fourniture de contenu numérique non fourni sur un support matériel dont l'exécution a
          commencé avec l'accord du consommateur et pour lequel il a renoncé à son droit de rétractation.
        </p>
        <p>
          En validant votre commande de photos numériques, vous reconnaissez et acceptez que la livraison du contenu
          numérique commence immédiatement et vous renoncez expressément à votre droit de rétractation.
        </p>
        <p>
          Pour les tirages imprimés, le droit de rétractation de 14 jours s'applique conformément à la législation
          en vigueur, sauf si les tirages sont personnalisés.
        </p>
      </section>

      <section>
        <h2>6. Propriété intellectuelle</h2>
        <p>
          Toutes les photographies proposées à la vente sont protégées par le droit d'auteur. L'achat d'une
          photographie confère à l'acheteur une licence d'utilisation personnelle et non commerciale.
          Toute reproduction, diffusion ou exploitation commerciale est interdite sans autorisation écrite préalable.
        </p>
      </section>

      <section>
        <h2>7. Réclamations</h2>
        <p>
          Pour toute question ou réclamation, vous pouvez nous contacter à l'adresse
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
      </section>

      <section>
        <h2>8. Droit applicable</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux compétents
          seront ceux du ressort du domicile du vendeur.
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
