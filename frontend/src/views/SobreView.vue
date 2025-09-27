<template>
  <div id="sobrebot-view">
    <!-- ... -->
    <div class="authors-section">
      <!-- A tag <a> é o card em si (a classe .author está nela) -->
      <a v-for="(author, index) in authors" 
         :key="index" 
         :href="author.link" 
         target="_blank" 
         rel="noopener noreferrer"
         class="author"> <!-- a classe 'author' está aqui -->

        <img :src="author.image" 
             :alt="'Foto de perfil de ' + author.name" 
             loading="lazy"
             width="150"
             height="150">
        
        <h3>{{ author.name }}</h3>
        <p>{{ author.description }}</p>
      </a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, getCurrentInstance, ref } from 'vue';
import Carlos from "@/assets/carloseduardo.jpg";
import Heitor from "@/assets/heitor.jpeg";
import Kallel from "@/assets/kallel.jpeg";
import Display from "@/assets/Display.jpeg";
import fotoNovo3 from "@/assets/foto-novo3.jpg";

const instance = getCurrentInstance();

onMounted(() => {
  instance.emit("update-title", "Sobre o Bot");
});

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

<style>
/* --- ESTILOS GERAIS E PARA DESKTOP (Telas Grandes) --- */

#sobrebot-view {
  margin-left: 260px; 
  padding: 20px;
  transition: margin-left 0.3s ease; 
}

.authors-section {
  display: grid;
  grid-template-columns: repeat(1, minmax(420px, 1fr));
  gap: 25px;
  padding: 40px 0;
}

/* O container do card que é um link clicável */
.author {
  width: 22%; 
  min-width: 980px; 
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  background-color: #fff;
  transition: transform 0.2s ease-in-out;
  text-decoration: none; /* Garante que o container não tenha sublinhado */
  
  /* Faz com que o conteúdo dentro dele se alinhe verticalmente */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.author:hover {
  transform: translateY(-5px);
}

.author img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 3px solid #f0f0f0;
}

/* ESTILO DO NOME DO AUTOR */
.author h3 {
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
  color: #333; /* Cor preta/cinza escuro padrão */
  text-decoration: none; /* Sem sublinhado */
}

/* ESTILO DA DESCRIÇÃO */
.author p {
  font-size: 1em;
  color: #555; /* Cinza um pouco mais claro para a descrição */
  text-decoration: none; /* Sem sublinhado */
  flex-grow: 1; /* Ajuda a alinhar a altura dos cards se as descrições tiverem tamanhos diferentes */
}

/* --- MEDIA QUERIES (Mantidas para responsividade) --- */
@media (max-width: 1024px) {
  .author {
    width: 45%; 
  }
}

@media (max-width: 768px) {
  #sobrebot-view {
    margin-left: 0; 
    padding: 15px;
  }
  .authors-section {
    gap: 15px;
    justify-content: center;
  }
  .author {
    width: 90%; 
    min-width: unset;
  }
  .author h3 {
    font-size: 1.1em;
  }
  .author p {
    font-size: 0.9em;
  }
}

body {
  background-color: #f8f8f8;
  font-family: 'Arial', sans-serif;
}
</style>
