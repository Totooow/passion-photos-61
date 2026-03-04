import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/galerie', name: 'gallery', component: () => import('@/views/GalleryView.vue') },
  { path: '/don', name: 'donation', component: () => import('@/views/DonationView.vue') },
  { path: '/panier', name: 'cart', component: () => import('@/views/CartView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
