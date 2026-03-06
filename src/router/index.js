import { createRouter, createWebHistory } from 'vue-router'
import { SITE_TITLE } from '@/config'
import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Accueil' } },
  {
    path: '/galerie',
    name: 'gallery',
    component: () => import('@/views/GalleryView.vue'),
    meta: { title: 'Galerie' },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
    meta: { title: 'FAQ' },
  },
  {
    path: '/don',
    name: 'donation',
    component: () => import('@/views/DonationView.vue'),
    meta: { title: 'Faire un don' },
  },
  {
    path: '/don/merci',
    name: 'donation-success',
    component: () => import('@/views/DonationSuccessView.vue'),
    meta: { title: 'Merci pour votre don' },
  },
  {
    path: '/don/annule',
    redirect: '/don',
  },
  {
    path: '/panier',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { title: 'Panier' },
  },
  {
    path: '/admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Admin' },
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('@/views/AdminFoldersView.vue'),
      },
      {
        path: 'folders/:folderId',
        name: 'admin-folder',
        component: () => import('@/views/AdminFolderPhotosView.vue'),
        meta: { title: 'Admin — Dossier' },
      },
      {
        path: 'commandes',
        name: 'admin-orders',
        component: () => import('@/views/AdminOrdersView.vue'),
        meta: { title: 'Admin — Commandes' },
      },
    ],
  },
  {
    path: '/mentions-legales',
    name: 'mentions-legales',
    component: () => import('@/views/MentionsLegalesView.vue'),
    meta: { title: 'Mentions légales' },
  },
  {
    path: '/cgv',
    name: 'cgv',
    component: () => import('@/views/CgvView.vue'),
    meta: { title: 'Conditions Générales de Vente' },
  },
  {
    path: '/commande/confirmation',
    name: 'checkout-success',
    component: () => import('@/views/CheckoutSuccessView.vue'),
    meta: { title: 'Commande confirmée' },
  },
  {
    path: '/commande/annulee',
    name: 'checkout-cancel',
    component: () => import('@/views/CheckoutCancelView.vue'),
    meta: { title: 'Paiement annulé' },
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — ${SITE_TITLE}` : SITE_TITLE
})

export default router
