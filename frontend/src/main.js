import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@/assets/global.css'
import router from './router' 
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import './style.css' 

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

app.mount('#app')

const toastOptions = {
    position: POSITION.TOP_RIGHT, // Posição padrão das notificações
    timeout: 5000, // Desaparecem após 5 segundos
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};

app.use(Toast, toastOptions);