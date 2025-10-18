import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // O estado: a sidebar está visível ou não?
  const isSidebarVisible = ref(false)

  // A ação: uma função para alternar o estado
  function toggleSidebar() {
    isSidebarVisible.value = !isSidebarVisible.value
  }
  
  // Ação para fechar a sidebar (útil para clicar fora)
  function closeSidebar() {
    isSidebarVisible.value = false;
  }

  return { isSidebarVisible, toggleSidebar, closeSidebar }
})