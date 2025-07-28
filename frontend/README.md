# Projeto Hub Sabiá - Frontend Vue.js

Este é o projeto frontend da aplicação Hub Sabiá, desenvolvido em Vue.js 3 com Vite.

## Funcionalidades Implementadas

*   **Design Formal:** Aplicação de um tema visual mais sóbrio e profissional em toda a interface.
*   **Navegação:** Estrutura de navegação com Sidebar e Header, incluindo páginas para Login, Dashboard, Campanhas, Chatbots e Usuários.
*   **CRUD de Campanhas (Simulado):**
    *   Interface para listar campanhas existentes em uma tabela.
    *   Card para adicionar novas campanhas.
    *   Formulário para criar e editar campanhas.
    *   Botões para editar e excluir campanhas na tabela.
    *   **Importante:** As operações de salvar, editar e excluir são **simuladas** no frontend. Os dados são gerenciados em memória e serão perdidos ao recarregar a página. A implementação de um backend é necessária para persistir os dados.
*   **Componentização:** Estrutura organizada em componentes Vue reutilizáveis.

## Como Executar Localmente

1.  **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) (que inclui o npm) instalado em sua máquina.
2.  **Descompacte o Projeto:** Extraia o conteúdo do arquivo `hub-sabia-vue.zip` para uma pasta de sua preferência.
3.  **Abra o Terminal:** Navegue até a pasta do projeto (`hub-sabia-vue`) pelo seu terminal ou prompt de comando.
4.  **Instale as Dependências:** Execute o comando abaixo para instalar todas as bibliotecas necessárias:
    ```bash
    npm install
    ```
5.  **Inicie o Servidor de Desenvolvimento:** Execute o comando abaixo para iniciar a aplicação em modo de desenvolvimento:
    ```bash
    npm run dev
    ```
6.  **Acesse no Navegador:** Abra seu navegador e acesse o endereço local fornecido pelo Vite (geralmente `http://localhost:5173` ou uma porta similar, caso a 5173 esteja em uso).

## Próximos Passos Sugeridos

*   **Implementação do Backend:** Desenvolver um servidor e banco de dados para conectar ao frontend e permitir o armazenamento real das campanhas, usuários, etc.
*   **Autenticação Real:** Implementar um sistema de autenticação seguro conectado ao backend.
*   **Desenvolvimento das Outras Seções:** Implementar as funcionalidades das seções de Chatbots e Usuários.
*   **Testes:** Adicionar testes unitários e de integração.

Fico à disposição para quaisquer dúvidas ou ajustes necessários!
