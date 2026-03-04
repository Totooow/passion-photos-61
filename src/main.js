import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { DISABLE_RIGHT_CLICK } from './config'

if (DISABLE_RIGHT_CLICK) {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault()
    }
  })
}

const app = createApp(App)
app.use(router)
app.mount('#app')
