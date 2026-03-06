# Passion Photos 61

Site de vente de photographies (numériques + tirages) avec paiement Stripe.

**Stack** : Vue 3 + Vite + Tailwind / API serverless Node.js 22 sur Scaleway / S3 Scaleway / Stripe Checkout

---

## 1. Prérequis

- Node.js 22+
- [Scaleway CLI](https://www.scaleway.com/en/cli/) (`scw`) configuré
- AWS CLI avec profil `scaleway-perso` configuré pour Scaleway S3
- Compte [Stripe](https://dashboard.stripe.com)

---

## 2. Configuration Scaleway

### S3 — Créer 2 buckets

Dans la console Scaleway (Object Storage, région `fr-par`) :

| Bucket | Visibilité | Usage |
|--------|-----------|-------|
| `passion-photos-61-storage` | Privé | Photos, `photos.json`, `orders.json` |
| `passion-photos-61-catalogue` | Public | Frontend (fichiers statiques) |

### S3 — Générer des clés API

Console Scaleway → IAM → API Keys → Créer une clé avec accès Object Storage.
Noter le `Access Key` et `Secret Key`.

### Serverless Functions — Déployer l'API

```bash
cd api
./deploy.sh
```

Le script crée le namespace et la fonction automatiquement. Après le premier déploiement, configurer les secrets dans la console Scaleway (Serverless → Functions → `pp61-api` → Settings → Environment variables / Secrets) :

| Variable | Valeur |
|----------|--------|
| `S3_BUCKET` | `passion-photos-61-storage` |
| `S3_REGION` | `fr-par` |
| `S3_ENDPOINT` | `https://s3.fr-par.scw.cloud` |
| `S3_ACCESS_KEY` | Clé d'accès S3 |
| `S3_SECRET_KEY` | Clé secrète S3 |
| `API_KEY` | Mot de passe admin (au choix) |
| `ALLOWED_ORIGIN` | URL du frontend (ex: `https://passionphotos61.fr`) |
| `SITE_URL` | URL du frontend (même valeur) |
| `STRIPE_SECRET_KEY` | `sk_test_...` ou `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (voir section Stripe) |

---

## 3. Configuration Stripe

### Clés API

Dashboard Stripe → Developers → API Keys :
- `Secret key` → mettre dans `STRIPE_SECRET_KEY` côté Scaleway
- `Publishable key` → pas utilisée (Stripe Checkout redirige)

### Webhook

Dashboard Stripe → Developers → Webhooks → Add endpoint :
- **URL** : `https://<url-fonction-scaleway>/webhook`
- **Events** : `checkout.session.completed`
- **Signing secret** (`whsec_...`) → mettre dans `STRIPE_WEBHOOK_SECRET` côté Scaleway

### CGV (pour la prod)

Dashboard Stripe → Settings → Checkout :
- Ajouter l'URL des CGV : `https://<domaine>/cgv`
- Puis décommenter `consent_collection` dans `api/handler.js`

---

## 4. Configuration Frontend

Créer `.env` à la racine :

```
VITE_S3_BASE_URL=https://passion-photos-61-storage.s3.fr-par.scw.cloud
VITE_API_URL=https://<url-fonction-scaleway>
```

### Développement

```bash
npm install
npm run dev
```

### Déploiement

```bash
./deploy.sh
```

Build + sync vers le bucket S3 `passion-photos-61-catalogue`.

---

## 5. Données

Le catalogue (`photos.json`) et les commandes (`orders.json`) sont stockés dans le bucket S3 privé.

Structure de `photos.json` :
```json
{
  "folders": [{ "id": "chevaux", "name": "Chevaux" }],
  "formats": [
    { "id": "10x15", "label": "10x15 cm", "type": "print" },
    { "id": "numerique", "label": "Numérique", "type": "digital" }
  ],
  "photos": [{ "id": "...", "folder": "chevaux", "title": "...", "src": "...", "prices": { "10x15": 2, "numerique": 1.5 } }]
}
```

---

## 6. Admin

Accessible sur `/admin`. Authentification par `API_KEY` (Bearer token).

Fonctionnalités : gestion dossiers, upload photos, édition prix, liste commandes.

---

## 7. Routes API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/checkout` | Non | Crée une session Stripe Checkout |
| POST | `/webhook` | Non (signature Stripe) | Webhook Stripe |
| GET | `/ping` | Oui | Health check |
| GET | `/orders` | Oui | Liste des commandes |
| POST | `/folders` | Oui | Créer un dossier |
| PUT | `/folders/:id` | Oui | Renommer un dossier |
| DELETE | `/folders/:id` | Oui | Supprimer un dossier |
| POST | `/photos` | Oui | Ajouter une photo |
| PUT | `/photos/:id` | Oui | Modifier une photo |
| DELETE | `/photos/:id` | Oui | Supprimer une photo |
| POST | `/presign` | Oui | URL présignée pour upload S3 |
