<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Sobre o Projeto</h2>
    </header>
    
    <div class="authors-section">
      <!-- O 'v-for' agora itera sobre os cards -->
      <a v-for="author in authors" 
         :key="author.name" 
         :href="author.link" 
         target="_blank" 
         rel="noopener noreferrer"
         class="author-card">

        <img :src="author.image" :alt="'Foto de ' + author.name">
        
        <div class="author-info">
          <h3>{{ author.name }}</h3>
          <p>{{ author.description }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
// MUDANÇA: Removemos 'onMounted' e 'getCurrentInstance' que não são mais necessários.
import { ref } from 'vue'; 
import Carlos from "@/assets/carloseduardo.jpg";
import Heitor from "@/assets/heitor.jpeg";
import Kallel from "@/assets/kallel.jpeg";
import fotoNovo3 from "@/assets/foto-novo3.jpg";

// O resto do seu script (a lista de autores) continua perfeito.
const authors = ref([
  {
    name: "Carlos",
    image: Carlos,
    link: "https://www.instagram.com/carloos_edu_01?igsh=cXk2OTduaHhuN2Yw",
    description: "Discente do IFPR - Campus Assis Chateaubriand",
  },
  {
    name: "Heitor",
    image: Heitor,
    link: "https://www.instagram.com/heitor_gavioli?igsh=angweDNpMmMyanhz",
    description: "Discente do IFPR - Campus Assis Chateaubriand",
  },
  {
    name: "Kallel",
    image: Kallel,
    link: "https://www.instagram.com/rag82815?igsh=MXQzcHNiY3d4Zm5ncg==",
    description: "Discente do IFPR - Campus Assis Chateaubriand",
  },
  {
    name: "Vagner Simoes",
    image: fotoNovo3,
    link: "https://www.instagram.com/prof.vagnersantos",
    description: "Docente do IFPR - Campus Assis Chateaubriand",
  },
]);
</script>

<style scoped>
.view-container {
  padding: 2rem;
}

.view-header h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
}

.authors-section {
  display: grid;
  /* Cria uma grade responsiva: colunas com no mínimo 350px de largura */
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.author-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 1.5rem;
  
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.author-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.author-card img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.author-info {
  text-align: left;
}

.author-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #343a40;
}

.author-info p {
  font-size: 0.95rem;
  color: #6c757d;
}

/* RESPONSIVIDADE PARA CELULARES */
@media (max-width: 767px) {
  .view-container {
    padding: 1rem;
  }
  .authors-section {
    /* Garante uma única coluna em celulares */
    grid-template-columns: 1fr;
  }
  .author-card {
    flex-direction: column; /* Empilha a imagem e o texto */
    text-align: center;
  }
  .author-card img {
    width: 120px;
    height: 120px;
  }
  .author-info {
    text-align: center;
  }
}
</style>
