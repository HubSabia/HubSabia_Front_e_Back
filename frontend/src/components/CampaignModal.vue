<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ isEditMode ? 'Editar Campanha' : 'Criar Nova Campanha' }}</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </header>
      
      <form @submit.prevent="handleSubmit" class="campaign-form">
        <!-- SEÇÃO DE UPLOAD DE IMAGEM - NOVA -->
        <div class="form-group full-width">
          <label for="imagem-campanha">Imagem da Campanha</label>
          
          <!-- Área de Upload -->
          <div v-if="!formData.imagemUrl" 
               class="upload-area"
               @click="triggerFileInput"
               @drop="handleDrop"
               @dragover="handleDragOver"
               @dragleave="handleDragLeave"
               :class="{ 'drag-over': dragOver }">
            <div class="upload-content">
              <CloudUploadIcon class="upload-icon" />
              <div class="upload-text">
                <span class="upload-main-text">Clique para fazer upload</span>
                <span class="upload-sub-text">ou arraste uma imagem aqui</span>
              </div>
              <input 
                ref="fileInput"
                type="file" 
                class="file-input"
                accept="image/*"
                @change="handleImageUpload"
              >
            </div>
            <p class="upload-hint">PNG, JPG, GIF ou WebP (até 10MB)</p>
          </div>

          <!-- Preview da Imagem -->
          <div v-else class="image-preview-container">
            <div class="image-wrapper">
              <img :src="formData.imagemUrl" :alt="formData.nome" class="image-preview">
              <div class="image-overlay">
                <button type="button" class="image-btn change-btn" @click="triggerFileInput" title="Alterar imagem">
                  <RefreshIcon class="btn-icon" />
                </button>
                <button type="button" class="image-btn remove-btn" @click="removeImage" title="Remover imagem">
                  <TrashIcon class="btn-icon" />
                </button>
              </div>
            </div>
            <p class="image-hint">Clique na imagem para alterar</p>
          </div>

          <!-- Status do Upload -->
          <div v-if="uploading" class="upload-status">
            <div class="upload-loading">
              <div class="loading-spinner"></div>
              <span>Fazendo upload da imagem...</span>
            </div>
          </div>

          <!-- Mensagem de Erro -->
          <div v-if="uploadError" class="upload-error">
            {{ uploadError }}
          </div>
        </div>

        <!-- Campos existentes mantidos -->
        <div class="form-group">
          <label for="nome-campanha">Nome da Campanha</label>
          <input type="text" id="nome-campanha" v-model="formData.nome" required>
        </div>
        
        <div class="form-group full-width">
          <label for="descricao-campanha">Descrição</label>
          <textarea id="descricao-campanha" v-model="formData.descricao" rows="3"></textarea>
        </div>
        
        <div class="form-group-row">
          <div class="form-group">
            <label for="inicio-campanha">Data de Início</label>
            <input type="date" id="inicio-campanha" v-model="formData.periodo_inicio" required>
          </div>
          <div class="form-group">
            <label for="fim-campanha">Data de Fim</label>
            <input type="date" id="fim-campanha" v-model="formData.periodo_fim" required>
          </div>
        </div>
        
        <div class="form-group-row">
          <div class="form-group">
            <label for="publico-alvo-campanha">Público-Alvo</label>
            <input type="text" id="publico-alvo-campanha" v-model="formData.publico_alvo">
          </div>
          <div class="form-group">
            <label for="status-campanha">Status</label>
            <select id="status-campanha" v-model="formData.status">
              <option>Planejada</option>
              <option>Ativa</option>
              <option>Concluída</option>
              <option>Cancelada</option>
            </select>
          </div>
        </div>
        
        <fieldset class="form-group full-width">
          <legend>Associar Editais</legend>
          <div v-if="isLoadingEditais" class="loading-message">Carregando editais...</div>
          <div v-else-if="listaDeEditais.length > 0" class="edital-selector-list">
            <div v-for="edital in listaDeEditais" :key="edital._id" class="edital-checkbox-item">
              <input type="checkbox" :id="`edital-${edital._id}`" :value="edital._id" v-model="formData.editais">
              <label :for="`edital-${edital._id}`">{{ edital.titulo }}</label>
            </div>
          </div>
          <p v-else class="no-editals-message">Nenhum edital cadastrado.</p>
        </fieldset>
        
        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="isLoadingSubmit || uploading">
            {{ isLoadingSubmit ? 'Salvando...' : (isEditMode ? 'Atualizar Campanha' : 'Criar Campanha') }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>

import { ref, watch, computed, nextTick } from 'vue';
import apiClient from '@/services/api';
import { useToast } from "vue-toastification";

const uploadToCloudinary = async (file) => {
  try {
    console.log('🔧 Iniciando upload para Cloudinary...');
    console.log('📁 Arquivo:', file.name, 'Tipo:', file.type, 'Tamanho:', file.size);
    
    // Validar o arquivo
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
    }

    // Validar tamanho (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('A imagem deve ter menos de 10MB.');
    }

    // VERIFICAR VARIÁVEIS DE AMBIENTE
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    console.log('🔑 Variáveis de ambiente:');
    console.log('   Cloud Name:', cloudName);
    console.log('   Upload Preset:', uploadPreset);

    if (!cloudName || !uploadPreset) {
      throw new Error('Configuração do Cloudinary não encontrada. Verifique as variáveis de ambiente.');
    }

    // Preparar form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // URL do Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('🌐 URL da API:', cloudinaryUrl);

    // Fazer upload
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      let errorMessage = `Upload falhou: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('❌ Erro detalhado do Cloudinary:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Upload concluído com sucesso!');
    console.log('📷 URL da imagem:', data.secure_url);
    
    return data.secure_url;

  } catch (error) {
    console.error('💥 Erro completo no upload:', error);
    throw new Error(error.message || 'Erro ao fazer upload da imagem');
  }
};

// Ícones (substitua pelos seus componentes reais)
const CloudUploadIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>' };
const RefreshIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>' };
const TrashIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>' };

const props = defineProps({ modelValue: Boolean, campaignToEdit: Object });
const emit = defineEmits(['update:modelValue', 'campaign-created', 'campaign-updated']);

const formData = ref({});
const fileInput = ref(null);
const isEditMode = computed(() => !!props.campaignToEdit);
const listaDeEditais = ref([]);
const isLoadingEditais = ref(false);
const isLoadingSubmit = ref(false);
const uploading = ref(false);
const dragOver = ref(false);
const uploadError = ref('');
const toast = useToast();

// Funções de upload
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  await processImageUpload(file);
};

const handleDrop = (event) => {
  event.preventDefault();
  dragOver.value = false;
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      processImageUpload(file);
    } else {
      uploadError.value = 'Por favor, selecione apenas imagens.';
    }
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  dragOver.value = false;
};

const removeImage = () => {
  formData.value.imagemUrl = '';
  uploadError.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const processImageUpload = async (file) => {
  try {
    uploading.value = true;
    uploadError.value = '';
    
    console.log('Iniciando upload do arquivo:', file.name);
    
    const imageUrl = await uploadToCloudinary(file);
    
    console.log('Upload concluído. URL:', imageUrl);
    formData.value.imagemUrl = imageUrl;
    
    toast.success("Imagem carregada com sucesso!");
    
  } catch (error) {
    console.error('Erro no upload:', error);
    uploadError.value = error.message;
    toast.error(error.message || "Erro ao fazer upload da imagem");
    
    // Limpar input de arquivo
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } finally {
    uploading.value = false;
  }
};

// Funções existentes mantidas
const buscarEditaisDisponiveis = async () => {
  isLoadingEditais.value = true;
  try {
    const response = await apiClient.get('/editais');
    listaDeEditais.value = response.data;
  } catch (error) {
    toast.error("Não foi possível carregar os editais.");
  } finally {
    isLoadingEditais.value = false;
  }
};

const closeModal = () => { 
  emit('update:modelValue', false); 
  // Resetar estados de upload
  uploading.value = false;
  dragOver.value = false;
  uploadError.value = '';
};

const handleSubmit = async () => {
  isLoadingSubmit.value = true;
  try {
    if (isEditMode.value) {
      const response = await apiClient.put(`/campanhas/${props.campaignToEdit._id}`, formData.value);
      emit('campaign-updated', response.data);
      toast.success("Campanha atualizada com sucesso!");
    } else {
      const response = await apiClient.post('/campanhas', formData.value);
      emit('campaign-created', response.data);
      toast.success("Campanha criada com sucesso!");
    }
    closeModal();
  } catch (error) {
    toast.error(error.response?.data?.msg || 'Não foi possível salvar a campanha.');
  } finally {
    isLoadingSubmit.value = false;
  }
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

watch(() => props.modelValue, (isOpening) => {
  if (isOpening) {
    buscarEditaisDisponiveis();
    if (isEditMode.value) {
      formData.value = {
        ...props.campaignToEdit,
        periodo_inicio: formatDateForInput(props.campaignToEdit.periodo_inicio),
        periodo_fim: formatDateForInput(props.campaignToEdit.periodo_fim),
        editais: props.campaignToEdit.editais?.map(e => e._id || e) || [],
        imagemUrl: props.campaignToEdit.imagemUrl || '' // Manter imagem existente
      };
    } else {
      formData.value = {
        nome: '',
        descricao: '',
        periodo_inicio: '',
        periodo_fim: '',
        publico_alvo: '',
        status: 'Planejada',
        editais: [],
        imagemUrl: ''
      };
    }
    
    // Resetar estados de upload
    uploading.value = false;
    dragOver.value = false;
    uploadError.value = '';
    
    // Limpar input de arquivo
    nextTick(() => {
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    });
  }
});
</script>

<style scoped>
.image-preview {
  max-width: 200px;
  height: auto;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.upload-status {
  font-size: 0.9rem;
  color: #007bff;
  margin-top: 0.5rem;
}
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: white; padding: 1.5rem 2rem; border-radius: 8px; width: 100%; max-width: 600px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e9ecef; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; }
.form-group { margin-bottom: 1rem; }
.form-group-row { display: flex; gap: 1rem; }
.form-group-row > .form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 4px; font-family: inherit; font-size: inherit; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; margin-top: 1.5rem; border-top: 1px solid #e9ecef; }
.btn-primary, .btn-secondary { padding: 0.6rem 1.2rem; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }

.edital-selector-list { max-height: 150px; overflow-y: auto; border: 1px solid #ced4da; border-radius: 4px; padding: 0.5rem; }
.edital-checkbox-item { display: flex; align-items: center; padding: 0.25rem; }
.edital-checkbox-item input { margin-right: 0.5rem; width: auto; }
.no-editals-message { font-size: 0.9rem; color: #6c757d; padding: 0.5rem; background-color: #f8f9fa; border-radius: 4px; text-align: center; }

@media (max-width: 767px) {
  .modal-content {
    /* Faz o modal ocupar quase toda a tela */
    width: 95vw; /* 95% da largura da tela */
    height: 90vh; /* 90% da altura da tela */
    max-width: none; /* Remove qualquer limite de largura máxima */
    
    padding: 1.5rem 1rem; /* Reduz o padding interno */
    
    /* Adiciona scroll se o conteúdo for muito grande */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Controla o scroll no container do formulário */
  }

  /* Faz o formulário ser a área de scroll, não o modal inteiro */
  .modal-content form {
    overflow-y: auto;
    flex-grow: 1;
    padding-right: 10px; /* Espaço para a barra de rolagem */
  }

  /* Empilha os campos que ficavam lado a lado */
  .form-group-row {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-footer {
    margin-top: 1.5rem;
  }
}
</style>