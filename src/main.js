import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { DISABLE_RIGHT_CLICK } from './config'

if (!import.meta.env.VITE_API_URL) {
  console.warn('[passion-photos-61] VITE_API_URL non configurée — l\'admin ne fonctionnera pas.')
}

if (DISABLE_RIGHT_CLICK) {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault()
    }
  })
}

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  console.error(`[Vue error] ${info}:`, err)
}

app.use(router)
router.isReady().then(() => app.mount('#app'))
