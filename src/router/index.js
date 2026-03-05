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
    path: '/don',
    name: 'donation',
    component: () => import('@/views/DonationView.vue'),
    meta: { title: 'Faire un don' },
  },
  {
    path: '/panier',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
    meta: { title: 'Panier' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Admin' },
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
