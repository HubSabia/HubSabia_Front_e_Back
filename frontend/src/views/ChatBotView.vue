<template>
    <div class="chat-container">
        <div v-if="loading" class="loading-overlay">
            <div class="loading-indicator">
                Processando.. aguarde alguns segundos... ⏳
            </div>
        </div>
		<div class="chat-box-parent">
        <div class="chat-box">
            <div v-for="message in mensagensVisiveis" :key="message.id" :class="{
                'user-message': message.sender === 'user',
                'ai-message': message.sender === 'model',
                message: true,
                clearfix: true,
            }" ref="messageElements">

                <div v-html="message.text"></div>

                <!-- {{ message.text }} -->
            </div>
		</div>

        </div>
        <div class="input-area">
            <textarea v-model="userInput" placeholder="Digite sua mensagem..." rows="3"></textarea>
            <button @click="sendMessage">Enviar</button>
            <!-- Botão para registrar nova conversa -->
            <!-- <button @click="registrarHistorico('João', 'Nova mensagem')">
            Registrar Conversa
            </button> -->
        </div>
    </div>
</template>
<style scoped>
/* Estilos do componente (os mesmos do código original, adaptados para scoped) */
template{
    box-shadow: inset 0px 0px 10px rgba(0, 0, 0, 0.05);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    /* Certifique-se de que a sobreposição esteja acima de outros elementos */
}

.loading-indicator {
    text-align: center;
    margin-top: 10px;
    font-size: 50px;
    font-style: italic;
    color: #663399;
    /* background-color: cornflowerblue; */
}

.chat-container {
    padding: 20px;
    margin: 0 auto;
    max-width: 600px;
	height: 80vh;
    background-color: #f4f4f9;
    /* background-image: url('../assets/banner-geral-1536x864.png'); */

    /* Ajuste a imagem para cobrir todo o container */

    /* Centralize a imagem */
    border-radius: 15px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    /* background: linear-gradient(135deg, #fff, #e0e0e0); */
}
.chat-box {
    padding: 10px;
    height: 60vh;
    overflow-y: auto;
    margin-bottom: 10px;
    border-radius: 10px;
}

.input-area {
    display: flex;
    gap: 10px;
}

textarea {
    flex-grow: 1;
    padding: 15px;
    border-radius: 20px;
    border: 1px solid #ccc;
    resize: none;
    box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    background-color: #f9f9f9;
}

button {
    padding: 10px 30px;
    background-color: #663399;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;
    font-size: 16px;
}

button:hover {
    background-color: #5a2e88;
}

/* Estilos para as mensagens */
.message {
    margin: 10px;
    padding: 15px;
    border-radius: 10px;
    max-width: 60%;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    clear: both;
}

/* Mensagens do usuário à direita */
.user-message {
    background-color: #dcd6ff;
    text-align: right;
    float: right;
}

/* Mensagens da IA à esquerda */
.ai-message {
    background-color: #f1f1f1;
    text-align: left;
    float: left;
}

.clearfix::after {
    content: "";
    display: block;
    clear: both;
}
</style>
<script>
import { ref, onMounted, nextTick, computed } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai'
import axios from 'axios'
import { marked } from 'marked'

// --- VARIÁVEIS REATIVAS ---
const historico = ref([])
const userInput = ref('')
const chatBox = ref(null)
const messageElements = ref([])
const loading = ref(false)

const history = []

const messages = ref([
  {
    id: 0,
    sender: 'model',
    text: 'Pssssiu! 🐦 Sou o Sabiá, e cheguei voando para te ajudar na busca de informações da ASSISTÊNCIA ESTUDANTIL no Instituto Federal do Paraná! O que te traz por aqui? 😉',
  },
])

// --- INSTRUÇÕES E EDITAIS ---
const API_KEY = "AIzaSyBM6cOeHblW30Zxi8JCnwnirSAZgswlAOM"
const genAI = new GoogleGenerativeAI(API_KEY)

		var promptInicialDevBot = `Gemini, você é um Chatbot de texto com mensagens de orientações sobre o Programa de Assistência Complementar ao Estudande do IFPR , seus usuários tem interesse nas informações e querem se inscrever no programa. 
								Regras:
									1) As suas respostas e interações precisam ser descontraidas e divertidas;
									2) Só responda sobre as informações constantes no Editais 6 de 11/02/2025 do IFPR para o programa citado;
									3) Cuidado para não se enganar e informar curso que não existe.
									4) Os usuários serão alunos regularmente matriculados no IFPR, portanto não erre as informações. 
									5) Existe a possibilidade de pessoas de várias Campus diferente  buscarem informações contigo.
									6) As respostas devem sempre informar e relacionar o respectivo edital. 
									7) Se o interessado relatar que o CPF não está cadastrado no sistema de incrição, oriente a ele procurar a Secretaria Acadêmica e certificar-se que sua matricula foi realizada (Alguns alunos ingressantes podem ter este problema de CPF não cadastrado no Sistema de Gerenciamento da Assistência Estudantil (SiGAE) )
									8) Se algum interessado informar que os responsáveis não tem carteira digital, oriente eles a tentarem acessar a CTPS Digital. 
									9) Sempre que possível informe que para acessar mais informações, o usuário deverá acessar o edital especifico e forneça o link https://sei.ifpr.edu.br/sei/modulos/pesquisa/md_pesq_documento_consulta_externa.php?9LibXMqGnN7gSpLFOOgUQFziRouBJ5VnVL5b7-UrE5QcqkHxIU-eeKO6ozQYWqa3v2ikM2OxMbPXhmQIt8okTyruOUakeJH3wU5RzmMtP7yQTgqaNk5BbPlANANG4uAX 
	 																								 
									
									`;
		var ideiaDoChatBot = "Gemini, segue a ideia deste Chatbot, mensagem: Pssssiu! 🐦 Sou o Sabiá, e cheguei voando para te ajudar nas informações que tenha interesse no IFPR! O que te traz por aqui? 😉";
		var instrucoesGeraisPS2025 = `Instruções gerais para o processo seletivo 2025
								Inscrição
								A inscrição deve ser realizada através do Portal do Candidato, onde o candidato deverá realizar o login através de sua conta pessoal no Portal gov.br e seguir os passos dispostos no edital correspondente ao tipo de curso desejado.
								Prazos e forma de seleção
								Para os cursos técnicos integrados e subsequentes ao Ensino Médio, as inscrições estão abertas até o dia 1º de novembro de 2024. As inscrições têm um custo de R$30 e os candidatos têm até o dia 25 de outubro para solicitar a isenção do pagamento da taxa de inscrição. 
								Para os cursos de graduação, o período de inscrição vai até o dia 17 de janeiro de 2025. O custo das inscrições é de R$50 e a solicitação de isenção da taxa pode ser realizada até o dia 15 de janeiro de 2025. Para os cursos de licenciatura não é necessário o pagamento da taxa de inscrição. 
								É importante destacar que para o processo seletivo deste ano a forma de seleção mudou e não haverá prova. Para os cursos técnicos integrados ao Ensino Médio e subsequentes será feita uma análise de currículo escolar dos candidatos e, para os cursos superiores, será utilizada a nota do Enem.
								Cursos
								O processo seletivo do IFPR oferece opções de formação que atendem estudantes que estão concluindo o 9º ano do Ensino Fundamental e também os que estão concluindo ou que já concluíram o Ensino Médio. Confira abaixo os tipos de cursos ofertados.
								Cursos Técnicos
								Cursos técnicos integrados: oferecidos a quem já tenha concluído o Ensino Fundamental. Nesta forma de oferta, o estudante vai cursar o Ensino Médio de forma integrada à formação técnica, concluindo os dois cursos ao mesmo tempo no IFPR.
								Cursos técnicos subsequentes: oferecidos a quem já tenha concluído o Ensino Médio, conferindo ao estudante habilitação profissional técnica de nível médio.
								Cursos de graduação
								Cursos de Bacharelado: cursos superiores com organização curricular voltada à formação científica e humanística, conferindo ao diplomado conhecimentos em determinado campo do saber para o exercício de atividade profissional, acadêmica ou cultural, com o grau de bacharel. 
								Cursos de Licenciatura: cursos superiores com organização curricular que habilita plenamente o profissional a atuar como professor na Educação Básica, nos anos finais do Ensino Fundamental e no Ensino Médio, com o grau de licenciado.
								Cursos de Tecnologia: cursos superiores que possuem organização curricular estruturada a partir de eixos tecnológicos, habilitando o diplomado a atuar em áreas profissionais específicas nas quais sejam exploradas diferentes tecnologias, com o grau de tecnólogo.
								Inclusão Social
								Ao realizar a inscrição, o candidato pode optar por concorrer às vagas destinadas à ampla concorrência ou então às vagas destinadas à política de cotas adotada pelo IFPR. Atualmente, 75% das vagas de todos os cursos e turmas são destinadas à política de cotas da instituição. 
								60% (sessenta por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos que tenham cursado integralmente o Ensino Fundamental ou médio em escolas públicas do Brasil, em cursos regulares ou no âmbito da modalidade de Educação de Jovens e Adultos (EJA), ou que tenham obtido certificado de conclusão com base no resultado do exame nacional para certificação de competências de jovens e adultos (Encceja) ou de exames de certificação de competência ou de avaliação de jovens e adultos realizados pelos sistemas estaduais de ensino.
								10% (dez por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos autodeclarados pretos, pardos ou indígenas.
								5% (cinco por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos com deficiência.
								Os 25% restantes do total das vagas ofertadas para cada curso e turma são destinados à ampla concorrência.
								Localização
								Atualmente o IFPR está presente em 28 municípios do Paraná, em todas as regiões do Estado, em cidades de pequeno, médio e grande porte. É a instituição federal de ensino presente no maior número de cidades paranaenses e possui mais de 30 mil alunos matriculados. Para mais informações sobre os cursos ofertados acesse a página de cursos do IFPR. 
								Editais 
								Para mais informações sobre o processo seletivo, acesse os editais abaixo:
								Edital do Processo Seletivo para os Cursos Técnicos Integrados ao Ensino Médio (Link do edital: https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&codigo_verificador=3185070&codigo_crc=509D8EE8&hash_download=0370cf4de40094bd3487f69d4f09eeae1a8458f48b70057e64c1f8f65e7a31da323f9d1dd12fe05176a02e07be30bd6a2c58b6d2091c0f3fc8a38494dd06682b&visualizacao=1&id_orgao_acesso_externo=0).
								Edital do Processo Seletivo para os Cursos Técnicos Subsequentes (Link do edital: https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&codigo_verificador=3185078&codigo_crc=3103DDC4&hash_download=7a49bbe60544fbdd1f128a8d4d591d60cbcc010ed26e09d746bd9f0a0858cf252a3e2096bc6a52a5dfc2c5b00e5f36650891bddd6267ab57c0fc3c24df499a95&visualizacao=1&id_orgao_acesso_externo=0).
								Edital do Processo Seletivo para os Cursos Superiores de Licenciatura (Link do edital: https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&codigo_verificador=3185080&codigo_crc=AA4C2607&hash_download=fb3623431884b3de493d6936974daba1c5d675d6f0404a049c6866dc3bb523add21ef799a36ca0b015ab23ad44cbd2df04c11a728605d5a8337889fdf30ba60d&visualizacao=1&id_orgao_acesso_externo=0
								.
								Edital do Processo Seletivo para os Cursos Superiores de Bacharelado e Tecnologia  (Link do edital: https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&codigo_verificador=3185087&codigo_crc=E00D4E0C&hash_download=982b938830beff658e4efa353c6e2709641d700325f37d6a140b6097c525144e43434e4ec64d6a0906bdb563e6d7bd119fbb42c5cb9e8cdbdda374fecf4d2a18&visualizacao=1&id_orgao_acesso_externo=0
								.

								`;
		instrucoesGeraisPS2025 = "";
		var instrucoesIniciais = promptInicialDevBot + instrucoesGeraisPS2025 + ideiaDoChatBot; 
		//gemini-1.5-flash
       	const model = genAI.getGenerativeModel({
  		model: 'gemini-1.5-flash-8b',
  		system_instruction: instrucoesIniciais
		});
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
        };

		// --- FUNÇÕES PRINCIPAIS ---
        const sendMessage = async () => {
            if (userInput.value.trim() === '') return;

			var edital6_2025 = ` 
   
   Edital N°8, de 11 de fevereiro de 2025

RETIFICADO


O DIRETOR SISTÊMICO DE ASSUNTOS ESTUDANTIS DO INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO PARANÁ, no uso da competência que lhe confere a Portaria nº 543, de 06 de março de 2024, publicada no Diário Oficial da União em 07 de março de 2024, seção 2, página 19, resolve tornar pública a inscrição para fins de concessão de benefício direto ao estudante e dá providências administrativas e financeiras no âmbito do PROGRAMA DE ASSISTÊNCIA COMPLEMENTAR AO ESTUDANTE PACE 2025, visando contribuir com o custeio parcial pelo discente das despesas essenciais à sua permanência e êxito acadêmico.

 

 

1. DA BASE LEGAL

1.1. Lei n° 14.914, de 3 de julho de 2024, que institui a Política Nacional de Assistência Estudantil (PNAES);

1.2. Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio e dá outras providências;

1.3. Lei n.° 13.709, de 14 de agosto de 2018, que dispões sobre a Lei Geral de Proteção de Dados Pessoais (LGPD);

1.4. Decreto nº 7.234, de 19 de julho de 2010, que dispõe sobre o Programa Nacional de Assistência Estudantil - PNAES;

1.5. Resolução IFPR nº 11, de 21 de dezembro de 2009, que aprova a Política de Apoio Estudantil do Instituto Federal do Paraná;

1.6. Instrução Normativa Conjunta nº 2, de 14 de fevereiro de 2025. 

 

2. DO OBJETO

O presente Edital destina-se a selecionar estudantes matriculados nos cursos técnicos de nível médio (integrado, concomitante e subsequente), graduação (licenciatura, bacharelado e tecnólogo) e Cursos de Educação de Jovens e Adultos articulada à Educação Profissional e Tecnológica - EJA/EPT do IFPR, na modalidade PRESENCIAL, em situação de vulnerabilidade socioeconômica, visando para concessão de benefício direto ao estudante para fins de custear parcialmente despesas como: alimentação, moradia, transporte e aquisição de material didático.

 

3. DOS REQUISITOS

3.1 Possuir matrícula ativa junto ao IFPR, em um dos seguintes níveis do ensino presencial:

3.1.1 Cursos Técnicos de nível médio (concomitante, integrado e subsequente);

3.1.2 Cursos de Graduação (licenciatura, bacharelado e tecnólogo).

3.1.3 Cursos de Educação de Jovens e Adultos articulada à Educação Profissional e Tecnológica - EJA/EPT.

3.2 Prioritariamente estar matriculado/a em pelo menos dois componentes curriculares no ano/semestre, na etapa de concessão.

3.3. Atender e comprovar pelo menos uma das seguintes situações:

ser integrante de grupo familiar em situação de vulnerabilidade socioeconômica, observado o limite de renda bruta familiar mensal per capita de até 1 (um) salário mínimo;

ser egresso da rede pública de educação básica;

ser egresso da rede privada na condição de bolsista integral na educação básica;

estar matriculado nas vagas reservadas aos autodeclarados pretos, pardos, indígenas e quilombolas e por pessoas com deficiência, conforme Lei nº 12.711, de 29 de agosto de 2012;

ser estudante com deficiência a qual requeira acompanhamento pedagógico necessário à sua permanência no IFPR, independentemente de sua origem escolar ou renda;

ser estudante oriundo de entidade ou de abrigo de acolhimento institucional não adotado em idade de saída;

ser estudante quilombola, indígena ou de comunidades tradicionais;

ser estudante estrangeiro em situação de vulnerabilidade socioeconômica ou refugiado.

3.4 Comprovar requisitos de elegibilidade e situação de vulnerabilidade socioeconômica, através de documentação pertinente – vide Anexos I e II deste Edital.

3.5 Proceder à autorização e ciência de sua inscrição, em conformidade à Lei Geral de Proteção de Dados Pessoais - LGPD, ao logar no SiGAE.

3.5.1 Na hipótese de não haver a autorização, a inscrição não poderá ser realizada.

3.5.2 A qualquer tempo a autorização poderá ser alterada pelo discente.

3.6 Não ter pendência de pagamento de Guia de Recolhimento da União – GRU, referente aos Programas da Assistência Estudantil até a publicação do resultado final deste Edital, referente aos exercícios atual ou anterior.

 

4. DA INSCRIÇÃO

4.1 As inscrições serão recebidas das 08h do dia 24 de fevereiro às 12h00 de 04 de abril de 2025, pelo horário de Brasília, exclusivamente pelo Formulário Eletrônico de Inscrição, no Sistema de Gerenciamento da Assistência Estudantil - SiGAE do Instituto Federal do Paraná, disponível em https://sigae.ifpr.edu.br a partir da data de início das inscrições.

4.1.1 Somente serão consideradas as inscrições finalizadas até às 12h de 04 de abril de 2025.

4.2 Os documentos - vide Anexos I e II, deverão ser, obrigatoriamente, anexados ao Formulário Eletrônico - SiGAE, no decorrer da inscrição, nos formatos .pdf ou .jpg com tamanho máximo de 10mb.

4.2.1 O Tutorial contendo o passo a passo para a inscrição e submissão de documentos no SIGAE encontra-se disponível em: https://ifpr.edu.br/menu-academico/assistencia-estudantil/tutoriais-assistencia-estudantil/assistencia-estudantil-tutoriais/

4.3 Os discentes que não possuem acesso à internet poderão dirigir-se ao laboratório de informática do seu campus, no período especificado no item 4.1, e havendo quaisquer dúvidas deverão procurar a Seção Pedagógica e de Assuntos Estudantis – SEPAE ou setor responsável.

4.4 Em caso de necessidade de suporte técnico referente ao funcionamento do SiGAE, o servidor responsável no campus deverá abrir chamado exclusivamente por meio da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br), selecionando tipo de sistema "SIGAE", bem como realizar o acompanhamento e o retorno com a solução ao candidato.

4.4.1 Serão analisados os chamados abertos pelo servidor responsável até às 10h horas do dia 04 de abril de 2025.

4.4.2 O suporte técnico por parte da DGTI e DAES, em relação ao SiGAE, será fornecido durante o período de inscrição, no horário das 08h do dia 24 de fevereiro às 10h do dia 04 de abril de 2025, somente nos dias úteis e em horário de expediente das 08h às 17h, exclusivamente por chamado da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br).

 

5. DOS INSCRITOS

5.1 A DAES publicará no Sistema Eletrônico de Informações - SEI, disponível em SEI - Publicações Eletrônicas (ifpr.edu.br), a relação preliminar das inscrições recebidas, até 04 de abril de 2025.

5.1.1 A DAES disponibilizará o Edital na página da Assistência Estudantil, disponível em Editais – Instituto Federal do Paraná (ifpr.edu.br), até 04 de abril de 2025.

5.2 O discente terá das 08h de 07 de abril às 12h de 08 de abril de 2025, para formalizar pedido recursal em caso de inscrição não recebida, junto ao campus.

5.3 O campus deverá abrir chamado, exclusivamente por meio da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br), selecionando tipo de sistema "SIGAE", acompanhar a evolução da solicitação e informar ao candidato.

5.3.1 No chamado deverão ser informados obrigatoriamente os dados do discente, tais: nome completo, CPF, e-mail e número do protocolo gerado pelo SiGAE.

5.4 A DAES publicará no Sistema Eletrônico de Informações - SEI, disponível em SEI - Publicações Eletrônicas (ifpr.edu.br) o edital de homologação dos inscritos até 09 de abril de 2025.

5.4.1 A DAES disponibilizará o Edital na página da Assistência Estudantil, disponível em Editais – Instituto Federal do Paraná (ifpr.edu.br), até 09 de abril de 2025.

5.5 Não caberá recurso ao discente que não cumprir as etapas e prazos previstos neste edital.

5.6 É de responsabilidade do discente a ciência a respeito da situação de sua inscrição.

5.7 O campus disponibilizará em sua página institucional e em local visível e de fácil acesso a lista de inscritos para ciência e conhecimento dos candidatos.

 

6. DA ANÁLISE SOCIOECONÔMICA

6.1 O período de análise será das 08h do dia 09 de abril até às 12h do dia 05 de maio de 2025.

6.2 Serão classificados os discentes conforme Índice de Vulnerabilidade Social.

6.3 A avaliação e parecer socioeconômico serão realizados exclusivamente pelos servidores ocupantes do cargo de Assistente Social, lotados na Reitoria, e nos campi, conforme Quadro de Distribuição de Análises, que será disponibilizado pela Diretoria de Assuntos Estudantis, na página da Assistência Estudantil.

 

7. DA ADMISSÃO DE DOCUMENTAÇÃO PENDENTE

7.1 A DAES extrairá as informações do Sistema de Gerenciamento da Assistência Estudantil - SiGAE e publicará no Sistema Eletrônico de Informações - SEI, disponível em SEI - Publicações Eletrônicas (ifpr.edu.br), edital contendo a relação de discentes com documentação pendente, até 05 de maio de 2025.

7.1.1 A DAES disponibilizará o Edital na página da Assistência Estudantil, disponível em Editais – Instituto Federal do Paraná (ifpr.edu.br), até 05 de maio de 2025.

7.2 Os discentes terão o período do dia 06 de maio até às 17h do dia 08 de maio de 2025, para submeter a documentação pendente, a partir de seu acesso ao Sistema de Gerenciamento da Assistência Estudantil - SiGAE.

7.2.1 O Tutorial contendo o passo a passo para a submissão de documentação pendente no SIGAE encontra-se disponível em: https://ifpr.edu.br/menu-academico/assistencia-estudantil/tutoriais-assistencia-estudantil/assistencia-estudantil-tutoriais/

7.2.2 Não serão admitidas alterações informadas no cadastro de inscrição.

7.3 Os discentes que não possuem acesso à internet poderão dirigir-se ao laboratório de informática do seu campus, no período especificado no item 7.2, e havendo quaisquer dúvidas deverão procurar a Seção Pedagógica e de Assuntos Estudantis – SEPAE ou setor responsável.

7.4 Em caso de necessidade de suporte técnico referente ao funcionamento do SIGAE, o servidor responsável no campus deverá abrir chamado exclusivamente por meio da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br), selecionando tipo de sistema "SIGAE", bem como realizar o acompanhamento e o retorno com a solução ao candidato.

7.4.1 Serão analisados os chamados abertos pelo servidor responsável até às 15h do dia 08 de maio de 2025.

7.5 O suporte técnico por parte da DGTI e DAES, em relação ao SiGAE, será fornecido durante o período de submissão de documentos pendentes, somente nos dias úteis e em horário de expediente das 08h às 17h, exclusivamente pelo chamado da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br).

7.6 Em nenhuma hipótese será admitida documentação recebida fora do sistema e do prazo estipulado.

 

8. DA ANÁLISE SOCIOECONÔMICA - PÓS ADMISSÃO DE DOCUMENTAÇÃO PENDENTE

8.1 O período de análise será das 08h do dia 09 de maio de 2025 até às 12h do dia 23 de maio de 2025.

8.2 A avaliação e parecer socioeconômico serão realizados exclusivamente pelos servidores ocupantes do cargo de Assistente Social, lotados na Reitoria, e nos campi, conforme Quadro de Distribuição de Análises, que será disponibilizado pela Diretoria de Assuntos Estudantis, na página da Assistência Estudantil.

 

9. DO RESULTADO PRELIMINAR

9.1 A DAES extrairá os dados diretamente do Sistema de Gerenciamento da Assistência Estudantil – SiGAE e publicará no Sistema Eletrônico de Informações - SEI, disponível em SEI - Publicações Eletrônicas (ifpr.edu.br) até o dia 23 de maio de 2025.

9.1.1 A DAES disponibilizará o Edital na página da Assistência Estudantil, disponível em Editais – Instituto Federal do Paraná (ifpr.edu.br), até 23 de maio de 2025.

9.2 Os discentes poderão ter suas solicitações deferidas ou indeferidas.

 

10. DA INTERPOSIÇÃO DE RECURSOS

10.1 Os discentes terão das 08h do dia 26 de maio até às 17h do dia 27 de maio de 2025 para interpor recurso diretamente no Sistema de Gerenciamento da Assistência Estudantil – SiGAE.

10.1.1 O Tutorial contendo o passo a passo para a interposição de recurso no SIGAE encontra-se disponível em: https://reitoria.ifpr.edu.br/menu-academico/assistencia-estudante/assistencia-estudantil-tutoriais/

10.2 Os discentes que não possuem acesso à internet poderão dirigir-se ao laboratório de informática do seu campus, no período especificado no item 10.1, e havendo quaisquer dúvidas deverão procurar a Seção Pedagógica e de Assuntos Estudantis – SEPAE ou setor responsável.

10.3 Em caso de necessidade de suporte técnico referente ao funcionamento do SIGAE, o servidor responsável no campus deverá abrir chamado exclusivamente por meio da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br), selecionando tipo de sistema "SIGAE", bem como realizar o acompanhamento e o retorno com a solução ao candidato.

10.3.1 Serão analisados os chamados abertos pelo servidor responsável até às 15h do dia 27 de maio de 2025.

10.4 O suporte técnico por parte da DGTIC e DAES, em relação ao SiGAE, será fornecido durante o período de interposição de recursos, no horário das 08h às 17h, somente nos dias úteis, exclusivamente por chamado de Central de Serviços - SUAP.

10.5 Os pedidos de recursos serão analisados no período das 14h de 27 de maio até às 17h do dia 29 de maio de 2025, conforme Quadro de Distribuição de Análises, que será disponibilizado pela Diretoria de Assuntos Estudantis, na página da Assistência Estudantil.

10.6 Não caberá recurso ao discente que não cumprir as etapas e prazos previstos neste edital.

 

11. DA CONCESSÃO E RESULTADO FINAL

11.1 A concessão será realizada diretamente no Sistema de Gerenciamento da Assistência Estudantil - SiGAE, das 08h até às 17h do dia 02 de junho de 2025.

11.2 A DAES extrairá os dados diretamente do Sistema de Gerenciamento da Assistência Estudantil – SiGAE, e publicará no Sistema Eletrônico de Informações - SEI, disponível em SEI - Publicações Eletrônicas (ifpr.edu.br) até 03 de junho de 2025 o Resultado Final.

11.3 A DAES disponibilizará o Edital na página da Assistência Estudantil, disponível em Editais – Instituto Federal do Paraná (ifpr.edu.br), até 03 de junho de 2025.

11.4 Os discentes serão classificados conforme o Índice de Vulnerabilidade Socioeconômica - IVS apurado na análise documental.

11.5 Havendo empate entre dois ou mais candidatos/as que vierem a ocupar idêntica classificação, adotar-se-á como critério de desempate, sucessivamente: a menor renda familiar per capita, origem escolar e a lei 12.711/2012, nesta ordem.

11.6 Os discentes que atenderem os requisitos deste edital terão suas solicitações deferidas ou inseridos em lista de espera, conforme número de vagas por campi.

11.7 Os discentes cujas solicitações foram deferidas ou em lista de espera, terão o Índice de Vulnerabilidade Socioeconômico válido por 24 (vinte e quatro) meses, excetuando-se aqueles com o índice apurado em exercícios anteriores.

11.8 Os discentes que não atenderem os requisitos deste edital terão suas solicitações indeferidos.

11.9 Sobre a classificação final não caberá recurso.

 

12. DO NÚMERO DE AUXÍLIOS, DISCENTES ATENDIDOS E DOS RECURSOS FINANCEIROS

12.1 Serão ofertados até 30.900 (trinta mil e novecentos) auxílios, referentes a este edital, para o exercício 2025.

12.2 Serão atendidos até 5.150 (cinco mil, cento e cinquenta) discentes por mês, considerando o prazo de vigência estabelecido no item 13.

12.3 O valor do auxílio fica fixado em: R$ 200,00 (duzentos reais) para IVS entre 0,1 e 2,0; e R$ 360,00 (trezentos e sessenta reais) para IVS acima de 2,0. Os valores são mensais, podendo ser reajustados, para mais ou menos, mediante disponibilidade orçamentária, sem quaisquer prejuízos à administração.

12.4 O valor total previsto para este programa é de até de R$ 7.188.000,00 (sete milhões, cento e oitenta e oito mil reais), à conta da Ação 2994 - Assistência ao Educando da Rede Profissional e Tecnológica, conforme Quadro abaixo:

 

Valores

faixa IVS

n.° de bolsas

n.° de parcelas

Valor da bolsa

Recurso TOTAL

Valor 1

0,1 |- 2,0

4100

6

R$ 200,00

R$ 4.920.000,00

Valor 2

2,0 |- 10

1050

6

R$ 360,00

R$ 2.268.000,00

 

TOTAL

R$ 7.188.000,00

 

12.5 O número de auxílios concedidos por campus será: 50% proporcional ao quantitativo de discentes cadastrados no Portal INFO/PROPLAN/IFPR ano-base 2024, uma vez que o recurso para 2025 tem como base as extrações desse exercício; e, 50% considerando, o percentual de discentes dentro do perfil socioeconômico das análises pertinentes a este edital.

12.6 O quantitativo de auxílios destinado a cada campus será publicado até 23 de maio de 2025.

12.7 O valor total do auxílio devido ao discente deverá ser creditado mensalmente à conta corrente do discente, a partir da autorização do ordenador de despesas da unidade.

12.7.1 Por ocasião da saída e entrada de bolsistas durante o interstício do Programa, fica assegurado o pagamento proporcional ao discente desligado e ao discente ingressante.

12.7.2 Nos casos de desligamento por transferência externa, trancamento de matrícula, desistência ou falecimento, o discente não fará jus ao pagamento proporcional.

12.7.3 Em virtude de pagamento proporcional, tomar-se-á por base 30 (trinta) dias corridos, não devendo ser contabilizado o dia 31, considerando o valor total do auxílio recebido pelo discente.

12.7.4 A soma dos pagamentos proporcionais de bolsista desligado e ingressante a partir da lista de espera, deve ser igual ao valor do auxílio integral, de forma a não comprometer o saldo orçamentário inicialmente destinado.

12.8 Para fins administrativos e financeiros, o interstício de registro de frequência dos bolsistas deve apurar a permanência entre o período do dia 16 ao dia 15 do mês subsequente. Excepcionalmente para pagamento da competência de junho deverá ser aferida a frequência do bolsista correspondente ao interstício do dia 03/06/2025 a 15/06/2025, garantido o valor integral do auxílio total devido ao discente.

12.8.1 Discentes que não estiverem em aula dentro do período de interstício, exceto período de férias referente ao mesmo período/ano letivo, o responsável deve aferir no SiGAE como Frequência Suspensa - FS.

12.9 O valor do auxílio, concedido pela DAES, somente será creditado aos discentes efetivos em seus programas e não possuem natureza indenizatória, isto é, não será, sob nenhuma hipótese, o pagamento processado a terceiros em decorrência de quaisquer situações.

 

13. DO PRAZO DE VIGÊNCIA

13.1 O Programa terá vigência de 01 de junho a 30 de novembro de 2025, totalizando prazo de 06 (seis) meses.

13.2 Ao final do Programa, ficam automaticamente desligados todos os bolsistas.

 

14. DO INGRESSO, ACOMPANHAMENTO DE FREQUÊNCIA E PERMANÊNCIA DO BOLSISTA NO PROGRAMA

14.1 Rotinas Administrativas - à unidade a ser delegada pela Direção Geral do campus

14.1.1 Abrir processo no Sistema Eletrônico de Informações, do tipo: Assistência estudantil: Concessão de bolsas - inclusão sócio-educacional e digital (Edital), para registros dos assentamentos da vida acadêmica do discente durante a vinculação com este Programa (tais como: e-mail de solicitação de edital de desligamento / Termos Circunstanciados Avaliados/ Memorando de solicitação de pagamento e relacionar o mesmo ao processo administrativo deste Programa: 23411.000400/2025-45.

14.1.2 Acompanhar a publicação de editais de resultado e/ou chamada de lista de espera para fins de emitir o Termo de Compromisso - TC, por meio do Sistema de Gerenciamento da Assistência Estudantil - SiGAE, em até um dia após a publicação do edital.

14.1.3 Encaminhar o TC gerado pelo SiGAE ao discente por meio físico ou digital.

14.1.4 Receber o TC assinado pelo discente, e proceder ao upload no SiGAE para realizar baixa.

14.1.4.1 Somente após a entrega do TC, o sistema efetuará a liberação do bolsista para a etapa de registro de frequência.

14.1.5 Consultar, mensalmente, no SiGAE o registro de frequência do bolsista.

14.1.6 Notificar, preferencialmente por e-mail, ao bolsista com a frequência inferior a 75% (setenta e cinco) por cento.

14.1.7 Elaborar o Termo Circunstanciado Avaliado - TCA para fins de autorizar ou não o pagamento de ¾ (três quartos) do valor do auxílio, nos casos de frequência nos limites de 51% (cinquenta e um) por cento a 74% (setenta e quatro) por cento.

14.1.8 O TCA poderá ser elaborado uma única vez para cada bolsista, quando da primeira ocorrência de frequência inferior ao mínimo exigido e deverá conter a ciência da Direção Geral ou Seção Pedagógica e de Assuntos Estudantis.

14.1.8.1 O TCA deverá ser acostado ao processo administrativo aberto pela SEPAE.

14.1.8.2 O pagamento proporcional é devido apenas na primeira ocorrência de frequência inferior à mínima exigida.

14.1.9 Proceder ao acompanhamento pedagógico dos bolsistas, em vistas a reduzir os índices de evasão escolar e contribuir para o desempenho e êxito acadêmico.

14.1.10 Abrir e proceder aos encaminhamentos no processo administrativo, quanto ao pagamento dos bolsistas contemplados.

14.1.11 Informar à DAES , via e-mail SEI, a partir o processo administrativo do campus, para daes@ifpr.edu.br, o desligamento do bolsista, a partir dos motivos expostos no item 16, explicitando a data e o motivo do desligamento para fins de emissão e publicação de Edital.

14.1.12 Acompanhar a publicação do edital de desligamento para fins de emitir o Termo de Desligamento - TD do bolsista no Sistema de Gerenciamento da Assistência Estudantil - SiGAE.

14.1.13 Emitir o TD gerado pelo SiGAE ao discente, para assinatura.

14.1.14 Acompanhar a entrega do TD assinado.

14.1.15 Aguardar o prazo de 48 (quarenta e oito) horas da publicação do edital de desligamento para receber eventuais pedidos de recursos pós-desligamento do discente, e se aplicável, enviar e-mail SEI à DAES (daes@ifpr.edu.br), solicitando a recondução do bolsista ao programa.

14.1.15.1 A recondução do bolsista ao programa, por quaisquer que sejam os motivos, é devida uma única vez. Em caso de reincidência de desligamento, seja a pedido ou automático, não será possível admitir o discente ao programa.

14.1.15.2 Não havendo recursos pós-desligamentos, formalizar via e-mail SEI, no processo administrativo correspondente, à DAES (daes@ifpr.edu.br), se aplicável, a solicitação de chamada de lista de espera, para fins de publicação de edital.

14.1.15.3 Adotar as providências previstas nos itens 14.1.2 a 14.1.4 para bolsistas ingressantes por chamada de lista de espera.

14.1.16 Acompanhar a inclusão de avaliação do Programa pelo discente, no SiGAE.

14.1.17 Realizar, para toda e qualquer intercorrência em relação ao bolsista, registro de despacho e/ou Termo Circunstanciado Avaliado no processo administrativo, e quando se tratar de recursos financeiros, o mesmo deverá ser tramitado à DAES para deliberações finais, com a anuência do Diretor Geral do campus.

14.1.18 Proceder, em caso de pedido de recondução de discente ao programa, justificativa no processo administrativo, e tramitar à DAES para deliberações finais.

Parágrafo único: As documentações inseridas em processo administrativo, sejam: despachos, termos circunstanciados, justificativas e afins, devem, obrigatoriamente, conter a assinatura do Diretor Geral antes de sua tramitação à DAES.

14.1.19 Inserir a conta corrente do bolsista no SiGAE, em até 60 (sessenta dias) a contar da data da emissão do Termo de Compromisso.

14.1.19.1 Conferir e atualizar, sempre que pertinente, a conta corrente do discente no SiGAE.

14.1.19.2 O bolsista que não tiver a informação de dados bancários no SiGAE, será automaticamente desligado após o prazo estipulado.

14.1.20 Manter arquivadas todas as documentações físicas e/ou digitais do discente enquanto vinculado ao programa.

14.2. Cabe ao discente contemplado

14.2.1 Ler, assinar e devolver à SEPAE do campus o Termo de Compromisso - TC.

14.2.1.1 O prazo para o bolsista enviar o TC assinado é de 10 (dez) dias corridos, a contar da data de emissão do termo.

14.2.2 Possuir, obrigatória e exclusivamente, conta corrente, no Banco do Brasil, como titular (em seu nome) ou providenciar a sua abertura.

14.2.2.1 O bolsista menor de 16 (dezesseis) anos deverá abrir a conta corrente, acompanhado do seu responsável legal. Nestas condições o bolsista apresentará conta corrente conjunta.

14.2.2.2 O bolsista terá até 40 (quarenta) dias corridos, a partir da data de publicação do edital de resultado final e/ou chamada em lista de espera, para apresentar conta corrente, ativa e em situação regular, para inclusão da mesma no Sistema de Administração Financeira - SIAFI de modo a garantir o pagamento do auxílio.

14.2.2.3 A não apresentação e/ou regularização da conta corrente dentro do prazo previsto, ensejará no desligamento automático do programa, devendo o discente assinar o Termo de Desligamento - TD, que será emitido pelo campus.

Parágrafo único: É vedado o pagamento ao bolsista na modalidade de ordem de pagamento.

14.2.2.4 O Termo de Desligamento deverá ser enviado ao email dos estudantes.

14.2.3 Para permanência no Programa, o bolsista deve alcançar, cumulativa e mensalmente, no mínimo 75% (setenta e cinco por cento) de frequência, considerando:

14.2.3.1 A carga horária total do período letivo, nos casos de cursos técnicos de nível médio ou de graduação, observado o mês de competência para pagamento.

14.2.3.2 A frequência entre 51% (cinquenta e um por cento) a 74% (setenta e quatro por cento) mediante parecer elaborado pela campus poderá ser autorizada, por uma única vez, a concessão de ¾ (três quartos) do valor do auxílio, se na primeira ocorrência.

14.2.3.3 A frequência igual ou inferior a 50% (cinquenta por cento) acarreta na suspensão integral do auxílio.

14.2.3.4 A frequência inferior a 75% (setenta e cinco por cento), por 02 (dois) meses consecutivos ou alternados, acarretará no desligamento automático do programa, mesmo no caso em que o discente se enquadre no item 14.1.7, exceto nos casos de faltas justificadas por atestado médico, ou circunstância de força maior apurada pela unidade competente e homologada pela Direção Geral do campus, por meio de Termo Circunstanciado enviado para autorização da DAES.

14.2.4 Protocolar o atestado médico junto ao campus, em até 03 (três) dias úteis após a expedição pelo médico responsável.

14.2.4.1 O atestado poderá ser protocolado por terceiros, em virtude de impedimento por parte do discente.

14.2.5 Responder ao campus sempre que for questionado, no que tange a ciência de frequência nos casos de percentual inferior ao mínimo exigido, e demais solicitações pertinentes.

14.2.6 Responder à avaliação do programa, sobre a efetividade do programa para sua permanência, melhoria e êxito do desempenho acadêmico, quando disponibilizado no sistema.

14.2.7 Assinar o Termo de Desligamento, quando da saída no interstício do programa, sempre que o desligamento seja a pedido do estudante, ou por interesse da administração, ou quando não houver a apresentação e/ou regularização da conta corrente dentro do prazo.

14.2.8 Devolver, por meio de Guia de Recolhimento da União - GRU, por eventuais valores financeiros recebidos indevidamente, preferencialmente em cota única e dentro do exercício competente.

14.2.8.1 Poderá ser feito o parcelamento do valor total para fins de devolução via GRU, desde que o ressarcimento total ocorra dentro do exercício 2025.

14.2.8.2 A não devolução nos prazos e valores estabelecidos, fica o discente ciente do impedimento na participação em quaisquer outros Programas da Assistência Estudantil até a regularização da situação.

14.2.8.3 Fica o discente ciente de que a regularização da situação após o prazo encerrado de inscrição de eventual edital não gera direito à participação.

14.2.9 Prestar informações ao longo de sua permanência no programa, a pedido da administração, e a qualquer tempo, e por elas assumir inteira responsabilidade.

14.2.9.1 Declarações falsas acarretarão sanções previstas em lei e poderão ocasionar a perda do auxílio.

14.3 Registro de Frequência - à unidade a ser delegada pela Direção Geral do campus

14.3.1 Registrar a frequência mensal dos bolsistas utilizando-se do Sistema de Gerenciamento da Assistência Estudantil – SiGAE, a partir das informações de acompanhamento de frequência obtidas junto aos responsáveis pela matéria no campus.

14.3.1.1 Para fins de efetivação do registro de frequência, considerar-se-á os percentuais previstos no item 14.2.3.

14.3.2 Certificar-se da existência de atestado médico protocolado pelo bolsista no campus, para fins de justificativa no momento do registro da frequência no SiGAE.

14.3.3 Observar o prazo final definido pelo campus para efeitos de liquidação de pagamento mensal, para fins de registro de frequência.

14.3.3.1 Durante o período de registro de frequência, o sistema admite a realização de alterações e/ou correções.

14.3.3.2 Findado o prazo para o registro de frequência, não serão autorizadas alterações nos registros efetuados.

14.3.3.3 Nos casos de registros de frequência realizados equivocadamente, e que ocasionam em prejuízos indevidos ao discente, deverá ser instruído no processo administrativo aberto pelo campus, o Termo Circunstanciado Avaliado - TCA, em que deverá consistir na justificativa detalhada das circunstâncias e motivos que levaram ao respectivo registro.

14.3.3.3.1 O documento deverá ser assinado pelo servidor que efetuou os registros, o chefe de SEPAE, e mediante anuência do Diretor Geral, deverá ser tramitado o processo à DAES, para análise e posterior deliberação por parte da Pró-Reitoria de Ensino.

14.3.3.4 A ausência do registro de frequência mensal incidirá na suspensão do pagamento do auxílio ao bolsista naquele mês, não sendo possível o pagamento retroativo.

14.3.3.5 O período de férias acadêmicas correspondentes ao mesmo ano/período letivo, deve ser computado como frequência regular.

14.3.3.6 As situações de discentes que iniciarão ano/período letivo ou componentes curriculares em meses subsequentes, ou que não seja possível aferir a frequência do discente, deverá, no SiGAE, ser assinalada a opção Frequência Suspensa - FS.

14.3.3.6.1 Nos casos de registro frequência suspensa, o bolsista não fará jus ao pagamento correspondente ao mês de competência.

14.3.4 O indicado pela Direção Geral deverá abrir chamado por meio da Central de Serviços, do Sistema Unificado de Administração Pública - SUAP, disponível em Abrir Chamado para Sistemas - SUAP: Sistema Unificado de Administração Pública (ifpr.edu.br), para solicitar o acesso e habilitação da função para operações no Sistema de Gerenciamento da Assistência Estudantil, anexando a expressa indicação realizada.

14.4 Rotinas Financeiras - à unidade a ser delegada pela Direção Geral do campus

14.4.1 Abrir processo no Sistema Eletrônico de Informações, do tipo: Finanças: Execução Orçamentária e Financeira, e relacionar o mesmo ao processo administrativo deste Programa: 23411.004284/2024-52 e ao processo administrativo aberto pela unidade correspondente no campus.

14.4.2 Proceder ao registro de empenho do respectivo programa, no valor destinado ao campus.

14.4.2.1 Reforçar a NE sempre que necessário, a partir dos repasses orçamentários da DAES ao campus.

14.4.2.2 Anular parcial ou totalmente a NE, a pedido da Diretoria de Assuntos Estudantis, ou sempre que couber a ação.

14.4.3 Cadastrar, no SIAFI, as contas correntes dos bolsistas dentro do prazo de 45 (quarenta e cinco) dias, a partir da publicação do edital que concede o auxílio ao discente.

14.4.4 Receber a solicitação de pagamento da unidade competente, elaborar os cálculos devidos a cada bolsista e proceder à Lista de Credores no SIAFI.

14.4.4.1 Os bolsistas com saídas e entradas durante o interstício deverão ter seus pagamentos proporcionais lançados no SIAFI.

14.4.5 Proceder ao acompanhamento de liquidação, pagamento e devolução por Domicílio Bancário Inexistente (DBI), bem como apontar e lançar retroatividade nestes casos, mediante autorização do ordenador de despesas, em no máximo, por duas tentativas.

14.4.6 Excluir da Lista de Credores, os discentes que tiveram seus desligamentos efetivados mediante Edital publicado pela DAES.

14.4.6.1 Nos casos de discentes desvinculados do Programa ou do Instituto Federal do Paraná, intempestivamente, a ponto de não haver tempo hábil para publicação de Edital de desligamento e do TD, os mesmos poderão ser excluídos da Lista de Credores, de modo a evitar o pagamento indevido.

14.4.6.1.1 Nestas condições, o campus deverá adotar providências urgentes para fins de formalizar o desligamento, bem como providências pertinentes a cada caso.

14.4.7 Emitir GRU aos discentes que tenham recebido recursos indevidamente, com vencimento em até 30 (trinta) dias a partir da data de emissão, preferencialmente em cota única.

 

15. DA ADMINISTRAÇÃO DO PROGRAMA - DAES

15.1 Acompanhar e executar ações quando do recebimento dos e-mails SEI para providências de ordem administrativa e financeira.

15.2 Tornar públicos editais de movimentação de discentes, de desligamento, de chamadas de lista de espera, se aplicável, no Sistema Eletrônico de Informações e na página da Assistência Estudantil, sempre a pedido do campus.

15.3 Proceder, mediante edital de recondução, o estorno do Termo de Compromisso no Sistema de Gerenciamento da Assistência Estudantil - SiGAE.

15.3.1 O estorno é devido uma única vez, na ocorrência de segundo desligamento efetuado pelo campus, ou automático, o discente não será reconduzido ao programa.

15.4 A DAES realizará as tratativas quanto à descentralização de recursos aos campi para fins de registro e reforço de empenho.

15.5 Analisar as circunstâncias relatadas pelos campi, no Termo Circunstanciado Avaliado, e proceder aos encaminhamentos legais.

15.6 Instruir o processo administrativo, mediante despachos, memorandos, notas técnicas, e demais documentos para o bom desempenho e execução do programa.

15.7 Acompanhar o saldo de recursos mensalmente, e para novas descentralizações realizar as deduções pertinentes.

15.8 Compilar e encaminhar, mensalmente, as informações para publicação de transparência pública no Plano de Dados Abertos, dos discentes que receberam recursos.

 

16. DOS MOTIVOS DE DESLIGAMENTO

16.1 São motivos de desligamento:

Trancamento de matrícula do discente;

Transferência externa;

Jubilamento (Prazo de integralização);

Desistência do curso;

Conclusão do curso;

Solicitação do próprio discente, por escrito;

A pedido da administração, por escrito;

Frequência inferior ao mínimo exigido de 75% por dois meses consecutivos ou alternados;

Conta corrente não apresentada no prazo, conforme item 14.2.2.2;

Comprovação, a qualquer tempo, de informações inverídicas fornecidas pelo discente;

Não assinar/entregar, dentro do prazo estipulado, o Termo de Compromisso.

Falecimento;

16.2 Os desligamentos automáticos devem ser informados à DAES via e-mail SEI.

16.3 O discente desligado poderá interpor recurso em até 48 (quarenta e oito) horas da publicação do edital de desligamento, preferencialmente por e-mail ao campus.

16.4 Ao término da vigência do programa, todos os discentes ficam automaticamente desligados, e dispensados de assinatura de termo de desligamento.

 

17. DA TRANSFERÊNCIA INTERNA

17.1 O discente que transferir-se a outro campus do IFPR levará consigo o direito adquirido ao auxílio concedido, sendo a partir da data da transferência, o pagamento a ser processado pelo campus de destino.

17.2 O campus de origem deverá emitir o Termo de Desligamento, no SiGAE, por motivos de transferência interna, utilizando-se como base legal, a publicação do edital de transferência do auxílio para o campus destino.

 

18. DAS DISPOSIÇÕES FINAIS

18.1 É de inteira responsabilidade do discente e/ou de seu responsável legal a interpretação deste Edital, bem como o acompanhamento da publicação de todos os editais, atos, instruções e comunicados ao longo do período em que se realiza este Programa, a qual se dará por meio do endereço eletrônico do Sistema Eletrônico de Informações - SEI

(https://sei.ifpr.edu.br/sei/publicacoes/controlador_publicacoes.php?acao=publicacao_pesquisar&id_orgao_publicacao=0)

ou, em casos específicos, no endereço eletrônico da Assistência Estudantil, disponível em

https://reitoria.ifpr.edu.br/menu-academico/assistencia-estudante/editais/, não podendo deles alegar desconhecimento ou discordância.

18.2 A DAES não se responsabiliza por falhas técnicas de conexão à internet das operadoras do candidato, e que resultarem em inscrições e procedimentos não registrados na base do Sistema de Gerenciamento da Assistência Estudantil - SiGAE.

18.3 Em caso de dúvidas em alguma etapa deste Programa, o discente e/ou seu responsável legal, deverá contatar ao seu campus para fins de esclarecê-las.

18.4 O campus é responsável pela recepção, zelo e administração arquivística física e/ou digital de todas as documentações pertinentes a este edital.

18.5 A DAES, a qualquer tempo poderá solicitar quaisquer documentos para fins de acompanhar a efetividade da execução do programa.

18.6 Compete à DAES divulgar e fiscalizar o cumprimento deste edital.

18.7 Caberá à DAES, durante o período de vigência deste Programa, rever em qualquer momento o auxílio concedido ao discente, mediante comprovação de má fé nas informações prestadas.

18.8 Caberá à DAES, a qualquer tempo, acompanhar e fiscalizar, solicitar relatórios de execução parcial, além daqueles exigidos neste Edital, bem como realizar visitas, chamada por videoconferência ou ainda convocação dos participantes para reuniões tanto nas dependências da Reitoria ou dos campi para levantamento, diagnóstico de desempenho dos discentes.

18.9 A qualquer tempo este Programa poderá ser revogado total ou parcialmente, por motivo de interesse público ou da Administração Pública, sem que isso implique direito de indenização de qualquer natureza.

18.10 Na hipótese de não ocorrer disponibilidade orçamentária e financeira, para o exercício de 2025, a partir da Ação 2994, recurso previsto para este Edital, caberá à DAES, a qualquer tempo, tornar sem efeito este Edital.

18.11 A DAES não se responsabiliza pelo não recebimento ou atraso dos auxílios devido a problemas nas contas bancárias dos discentes.

18.12 Cabe à DAES a abertura de novos Editais de convocação, bem como a ampliação e/ou redução de auxílios deste Programa, durante o ano de 2025, a qualquer momento, quando julgar necessário para o desenvolvimento e êxito da política de assistência estudantil do IFPR, mediante disponibilidade orçamentária e edital específico.

18.13 O saldo de recursos não utilizados neste Programa poderá ser recolhido de modo que, mediante estudo e planejamento, seja redistribuído entre os demais programas da Assistência Estudantil.

18.14 Em eventual descumprimento de quaisquer etapas do programa por parte dos servidores, serão adotadas as medidas previstas no Art. 71, da Resolução nº 09/2021, e na Instrução Normativa nº 17/2019, da Corregedoria Geral da União - CGU.

18.14.1 Em caso de pagamentos solicitados por parte do servidor, de forma indevida, e não havendo condições de o discente realizar a devolução, o agente público deverá efetuar o ressarcimento ao erário.

18.15 Os casos omissos, não previstos neste Edital, serão dirimidos pela DAES.

18.16 Elege-se o foro da Justiça Federal de Curitiba como competente para dirimir as questões do edital não solucionadas administrativamente.

Curitiba, 11 de fevereiro de 2025.

 

 
ANEXO I

DOCUMENTAÇÃO PARA COMPROVAÇÃO DE ELEGIBILIDADE (REQUISITOS)

Para ser elegível a este Edital e concorrer ao auxílio, o estudante deve atender e comprovar uma das seguintes situações: 

SITUAÇÃO

DOCUMENTOS COMPROBATÓRIOS

QUEM DEVE ENTREGAR

Renda Familiar Per Capita */

Ocupação trabalho e emprego.

 

Obrigatório para todas as pessoas que compõem o grupo familiar maiores de 18 anos, inclusive o candidato, de acordo com a condição de trabalho.

 

Caso o núcleo familiar seja composto por integrante de diferentes categorias (assalariados, autônomos, etc.), cada membro deverá apresentar a documentação referente a sua própria categoria


				
Contracheque/holerite do mês de fevereiro/2025. Nos casos de contracheque/holerite que contenham: horas extras, ou adicional noturno, ou insalubridade, ou comissões, ou periculosidade, ou penosidade e transferência, deverá apresentar os três últimos holerites dos meses dezembro/2024, janeiro e fevereiro/2025 


				
Trabalhadores do mercado formal(celetistas/servidores públicos/

aprendiz)


				
Preencher e assinar declaração de Renda de Trabalho Informal, utilizar MODELO 2, deste Anexo.


				
Trabalhadores do mercado informal


				
Contracheque/holerite do mês de fevereiro/2025. Nos casos de contracheque/holerite que contenham: horas extras, ou adicional noturno, ou insalubridade, ou comissões, ou periculosidade, ou penosidade e transferência, deverá apresentar os três últimos holerites dos meses dezembro/2024, janeiro e fevereiro/2025; ou


				

				
Contrato de trabalho.


				
Trabalhador Intermitente

(trabalhador intermitente: prestador de serviços, com registro em carteira ou contrato, com subordinação, não contínua, ocorrendo com alternância de períodos de prestação de serviços e de inatividade

Ex: garçom)


				
Contracheque/holerite do mês de fevereiro/2025. Nos casos de contracheque/holerite que contenham: horas extras, ou adicional noturno, ou insalubridade, ou comissões, ou periculosidade, ou penosidade e transferência, deverá apresentar os três últimos holerites dos meses dezembro/2024, janeiro e fevereiro/2025, OU


				

				
Contrato de trabalho, OU


				

				
Preencher e assinar declaração de Renda de Trabalho Temporário, utilizar MODELO 2, deste Anexo.


				
Trabalhador temporário, trabalhador intermitente,

estágio e 

aprendizagem


				
Preencher e assinar Declaração renda de autônomo/liberal, utilizar MODELO 2, deste Anexo. E


				

				
Última guia de contribuição para o INSS (Carnê GPS), E


				

				
Declaração do sindicato, associação, ou cooperativa, contendo o valor recebido e as atividades desenvolvidas, quando houver OU;


				

				
Declaração Comprobatória de Percepção de Rendimentos (DECORE) emitida por profissional contábil, quando houver.


				
 

Autônomos e Liberais

 


				
Preencher e assinar declaração de Renda de Trabalhador Rural, utilizar MODELO 2 deste Anexo. Anexando as três últimas notas de vendas de produtos. E


				

				
Declaração de Aptidão ao PRONAF (DAP), OU


				

				
Declaração do sindicato rural, Associação, Cooperativa, ou Prefeitura, contendo o valor recebido mensalmente, contendo informações detalhadas referentes ao valor recebido e atividade desenvolvida.


				
Produtores rurais


				
Contracheque/holerite do mês de fevereiro/2025. Nos casos de contracheque/holerite que contenham: horas extras, ou adicional noturno, ou insalubridade, ou comissões, ou periculosidade, ou penosidade e transferência, deverá apresentar os três últimos holerites dos meses dezembro/2024, janeiro e fevereiro/2025, OU


				

				
Contrato de prestação de serviço.


				
Empregado rural


				
Preencher e assinar declaração de Renda de Empresário/Microempreendedor individual ou pessoas com participação em cotas de empresas e microempresas, o MODELO 2 deste Anexo; 


				

				
Pró Labore do mês de fevereiro/2025.


				

				
Declaração de Imposto de Renda de Pessoa Jurídica – IRPJ – completa, exercício 2024 ano calendário 2023, acompanhado do recibo de entrega, quando houver,


				

				
Declaração Comprobatória de Percepção de Rendimentos (DECORE), quando houver;


				

				
Declaração completa de Informações socioeconômicas e Fiscais (DEFIS- Simples Nacional) para Microempresários e Empresários de Pequeno Porte, quando houver.


				
Empresário ou pessoas com participação em cotas de empresas ou microempresas


				
Preencher e assinar a declaração de Renda de Empresário/Microempreendedor individual ou pessoas com participação em cotas de empresas e microempresas, o MODELO 2 deste Anexo; E


				

				
Declaração de Imposto de Renda de Pessoa Jurídica – IRPJ – completa, quando houver,


				

				
Declaração Anual do Simples Nacional (SIMEI), último vigente.


				
Microempreendedor Individual

 


				
Emitir Extrato de Pagamento de Benefício do INSS, via Meu INSS (https://meu.inss.gov.br/#/login), OU;


				

				
Extrato bancário detalhado com a identificação do titular, contendo o número do benefício do INSS e o valor integral do benefício (sem desconto de empréstimo consignado), de um dos 03 últimos meses (dezembro/2024, janeiro e fevereiro/2025). OU


				

				
Preencher e assinar a declaração de Renda de Aposentados/ pensionistas e beneficiários de auxílio-doença e demais benefícios INSS no MODELO 2 deste Anexo, informando o valor integral do benefício e extrato simples emitido pelo caixa eletrônico.


				

				
Comprovante de aposentadoria (caso não seja INSS).


				
Aposentados/ pensionistas e beneficiários de auxílio-doença e demais benefícios INSS


				
Contracheque/holerite do mês de fevereiro/2025. Nos casos de contracheque/holerite que contenham: horas extras, ou adicional noturno, ou insalubridade, ou comissões, ou periculosidade, ou penosidade e transferência, deverá apresentar os três últimos holerites dos meses dezembro/2024, janeiro e fevereiro/2025, OU


				

				
Contrato de prestação de serviço.


				
Empregado Doméstico


				
Cópia do Contrato(s) de estágio ou Termo de Compromisso


				
Estagiário/Bolsista

 


				
Em caso de desemprego recente, apresentar Rescisão de Contrato ou Extrato do FGTS e comprovante de seguro desemprego, caso receba. e/ou;


				

				
Preencher e assinar a declaração que não possui renda, utilizar MODELO 3, deste Anexo.


				
Pessoa SEM renda (todas as pessoas com idade superior a 18 anos, residentes na casa e desempregadas, discentes ou que não trabalham fora - deverão apresentar)


				
Contrato(s) de locação ou arrendamento(s) devidamente registrado(s), OU


				

				
No caso de não possuir Contrato, preencher e assinar a declaração para diversas situações, utilizar MODELO 1 deste Anexo, informando o valor recebido


				
Para rendimentos de aluguel ou arrendamento de bens móveis e imóveis urbanos e/ou rurais


				
Decisão judicial discriminando o nome dos beneficiários e o valor a ser pago, se houver, e comprovante de recebimento de pensão de um dos meses dezembro/2024, janeiro e fevereiro/2025, OU


				

				
Preencher e assinar declaração de recebimento de pensão alimentícia, utilizar MODELO 4, deste Anexo.


				
Para os casos de RECEBIMENTO de pensão alimentícia

Composição Familiar **	

				
RG (frente e verso) ou Certidão de Nascimento, ou documento oficial com foto, de todos os componentes da família.


				

				
CPF de todos os componentes da família maiores de 18 anos.


				

				
Declaração Completa do Imposto de Renda de Pessoa Física (IRPF), acompanhada do recibo de entrega, exercício 2024, ano calendário 2023.


				

				
Para os casos de pessoas isentas de declarar Imposto de Renda, apresentar comprovante exercício 2024, disponível (Consulta restituição IRPF)


				

				
Carteira de Trabalho e Previdência Social (física) atualizada para todos os componentes da família maiores de 18 anos, contendo as páginas: de identificação, da qualificação civil, do registro do último contrato de trabalho e a página e posterior em branco (mesmo sem registro); ou


				

				
Carteira de Trabalho Digital em PDF Único atualizada, contendo todos os dados pessoais, contrato de trabalho, caso não possua nenhum registro de contrato de trabalho, deverá apresentar a pagina “nenhum contrato de trabalho encontrado”


				

				
Caso não tenha carteira de trabalho, informar tal situação por meio da Declaração Para Diversas Situações (utilizar MODELO 1, deste Anexo). Exº furto/roubada/perda ( apresentar junto o Boletim de Ocorrência); nunca foi solicitada a emissão da CTPS; 


				

				
Comprovante de endereço de um dos meses (dezembro/2024, janeiro ou fevereiro/2025).


				
Obrigatório para o discente candidato e os demais familiares declarados no formulário de solicitação
Ser oriundo da rede pública de educação, ou oriundo da rede privada na condição de bolsista integral; 


				
Histórico Escolar do ensino fundamental (para discentes do ensino de nível médio e subsequente).


				

				
Histórico Escolar do ensino médio (para discentes da graduação).


				

				
Comprovante de bolsa integral em escola de rede privada, quando for o caso.


				
 
Estar matriculado nas vagas reservadas de que trata a Lei nº 12.711 (autodeclarados pretos, pardos, indígenas e quilombolas e por pessoas com deficiência); 

Caberá ao IFPR verificar no seu banco de dados, junto ao registro escolar quais candidatos entraram por ações afirmativas
 
Estudante com deficiência a qual requeira acompanhamento pedagógico necessário à sua permanência; 


				
Laudo médico ou psicológico


				
 
Estudante oriundo de entidade ou de abrigo de acolhimento institucional não adotado em idade de saída; 


				
Declaração da entidade/abrigo.


				
 
Estudante quilombola, indígena ou de comunidades tradicionais; 


				
Autodeclaração de Etnia, caso não tenha ingressado por ações afirmativas, conforme Modelo 5.


				
 
Estudante estrangeiro em situação de vulnerabilidade socioeconômica ou refugiado.


				
Auto declaração e comprovação de renda.


				
 
* CASO FIQUE EM DÚVIDA SOBRE O COMPROVANTE DE RENDA, ENTRE EM CONTATO COM A SEÇÃO PEDAGÓGICA DE ASSUNTOS ESTUDANTIS DO SEU CAMPUS.

** Apresentar os comprovantes de renda de TODAS as pessoas que residem em sua casa. Caso você resida sozinho e dependa financeiramente de seus familiares deverá apresentar comprovante de renda dos seus familiares e/ou pessoas que contribuem financeiramente com suas despesas e com a manutenção no IFPR.

 

ANEXO II

DOCUMENTAÇÃO COMPLEMENTAR PARA COMPROVAR OS INDICADORES DE VULNERABILIDADE DESCRITOS NO QUADRO ABAIXO:

* A AUSÊNCIA DA DOCUMENTAÇÃO COMPLEMENTAR ACARRETARÁ NO COMPROMETIMENTO DA ANÁLISE SOCIOECONÔMICA, MAS NÃO GERA INDEFERIMENTO NA FALTA DELES.

 
INDICADOR

QUEM DEVE APRESENTAR

DOCUMENTOS DE COMPROVAÇÃO

COMPOSIÇÃO FAMILIAR

O responsável legal que declarem possuir a guarda ou tutela do menor que não seja seu filho biológico. menor Ex: menor que reside com a avó, tios, ou outras pessoas, e os pais não residem na mesma casa;


				
Documentação oficial referente à Guarda ou Tutela OU


				

				
Caso não tenha documento oficial de Guarda ou Tutela, preencher e assinar declaração para Diversas Situações (utilizar MODELO 1, deste Anexo).


				
Moradia

Mora em imóvel alugado


				
Contrato de aluguel ou Comprovante de Pagamento de aluguel contendo dados do locador e locatário, valor do aluguel, discriminação do endereço do imóvel, data e assinatura, e Recibo de pagamento de um dos meses: dezembro/2024, janeiro ou fevereiro/2025, OU


				

				
Declaração assinada pelo locador e locatário, contendo dados do locador e locatário, valor do aluguel, discriminação do endereço do imóvel, data e assinatura e Recibo de pagamento de um dos meses meses: dezembro/2024, janeiro ou fevereiro/2025.


				
Mora em imóvel financiado

 


				
Comprovante de financiamento contendo valor da prestação e quantidade de parcelas a pagar; OU


				

				
Boleto desde que seja possível identificar mutuário, valor da prestação de um dos meses: dezembro/2024, janeiro ou fevereiro de 2025; OU


				

				
Extrato do financiamento


				
Mora em comunidade quilombola ou indígena


				
Preencher e assinar declaração de pertencimento à comunidade quilombola ou indígena, conforme MODELO 5, deste Anexo, OU


				

				
Declaração de pertencimento à comunidade indígena, expedido pela FUNAI;


				
Imóvel em Situação Irregular

 


				
Preencher e assinar declaração que reside em área de ocupação irregular, por meio da Declaração Para Diversas Situações (utilizar MODELO 1, deste Anexo).


				
Saúde

 

Todos os familiares com diagnóstico de doença grave ou crônica, transtorno mental e/ou Pessoa com deficiência)


				
Último atestado, laudo ou declaração médica; assinado por médico com CRM e contendo a Classificação Internacional de Doenças (CID). OU


				

				
Carteirinha de Associação de portador de doença/deficiência.


				
 

Obs.: entende-se por doença crônica, com base na Portaria MPAS-MS-2.998/2001, devidamente comprovadas mediante atestado médico, as seguintes doenças: tuberculose ativa; hanseníase; alienação mental; neoplasia maligna; cegueira; paralisia irreversível e incapacitante; cardiopatia grave; doença de Parkinson; espondioloartrose anquilosante; nefropatia grave; estado avançado da doença de Paget - osteíte deformante; síndrome da imunodeficiência adquirida - Aids; contaminação por radiação e hepatopatia grave.

Participação em Programas Sociais

Família que recebe Bolsa Família, Família Paranaense ou de programas Municipais de transferência de renda


				
Extrato bancário de recebimento do benefício com identificação de beneficiário, de um dos meses: dezembro/2024, janeiro ou fevereiro/2025.


				
 
CASO O SOLICITANTE OU SEUS FAMILIARES NÃO POSSUAM ALGUM DOCUMENTO EXIGIDO DEVE SER ENTREGUE UMA DECLARAÇÃO ASSINADA, DE PRÓPRIO PUNHO, EXPLICANDO A SITUAÇÃO.

 
QUALQUER DÚVIDA SOBRE OS DOCUMENTOS OU PREENCHIMENTO DO FORMULÁRIO DE INSCRIÇÃO, PROCURE A SEÇÃO PEDAGÓGICA DE ASSUNTOS ESTUDANTIS DO SEU CAMPUS.

 

MODELO 1

DECLARAÇÃO PARA DIVERSAS SITUAÇÕES

(NÃO SUBSTITUI DOCUMENTOS ESPECIFICAMENTE REFERENCIADOS OU SITUAÇÕES EXPLICITAMENTE DEFINIDAS)

EU, ___________________________________________________________________, portador do RG__________________________,CPF_____________________________DECLARO:

___________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

E, por isso ser expressão da verdade, comprometo-me a fazer prova onde necessário for, para os devidos fins de direito, repartições públicas federais, autarquias e onde mais necessário for, na forma da Lei.

Declaro também estar ciente das penalidades legais a que estou sujeito(a):

Crime de Falsidade Ideológica

Art. 299 - Omitir, em documento público ou particular, declaração que dele devia constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato juridicamente relevante:

Pena - reclusão, de 1 (um) a 5 (cinco) anos, e multa, se o documento é público, e reclusão de 1 (um) a 3 (três) anos, e multa, se o documento é particular.

Crime de Estelionato

Art. 171 - Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil, ou qualquer outro meio fraudulento:

Pena - reclusão, de 1 (um) a 5 (cinco) anos, e multa.

Assim sendo, por ser o aqui declarado a mais pura expressão da verdade, assino esta Declaração para que surta seus efeitos legais.

 

__________________________, _____/_____/2025

Local data

 

____________________________

Assinatura do/a declarante

 

 

 

MODELO 2

DECLARAÇÃO DE RENDA

Eu, _______________________________________________________________________, portador do RG_________________________, CPF_________________________ declaro para os devidos fins que sou:

( ) trabalhador informal (sem contribuição ao INSS).

( ) trabalhador temporário

( ) trabalhador autônomo/liberal (com contribuição ao INSS).

( ) produtor rural

( ) Empresário ou pessoas com participação em cotas de empresas ou microempresas

( ) Microempreendedor Individual - MEI

( ) Aposentados/ pensionistas e beneficiários de auxílio-doença e demais benefícios INSS exercendo atualmente a profissão/ocupação de _______________________________________ e recebendo mensalmente o valor aproximado de R$_________________________.

E, por isso ser expressão da verdade, comprometo-me a fazer prova onde necessário for, para os devidos fins de direito, repartições públicas federais, autarquias e onde mais necessário for, na forma da Lei.

Declaro também estar ciente das penalidades legais a que estou sujeito(a):

Art. 299 - Omitir, em documento público ou particular, declaração que dele devia constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato juridicamente relevante:

Pena - reclusão, de 01 (um) a 05 (cinco) anos, e multa, se o documento é público, e reclusão de 01 (um) a 03 (três) anos, e multa, se o documento é particular.

Art. 171 - Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil, ou qualquer outro meio fraudulento:

Pena - reclusão, de 01 (um) a 05 (cinco) anos, e multa.

Assim sendo, por ser o aqui declarado a mais pura expressão da verdade, assino esta declaração para que surta seus efeitos legais.

 

__________________________, _____/_____/2025

Local Data 

 

_______________________________________

Assinatura do/a declarante

 

 

 

 

MODELO 3

DECLARAÇÃO NÃO POSSUI RENDA MENSAL

 

Eu, _______________________________________________________________________, portador do RG nº __________________, inscrito no CPF _____________________,

 

DECLARO, sob as penas das leis, que não recebo, atualmente: salários, proventos, pensão por morte, aposentadorias, seguro desemprego, comissões, pró-labore, outros rendimentos do trabalho não assalariado, rendimentos do mercado informal ou autônomo, rendimentos auferidos do patrimônio e quaisquer outros.

Declaro também estar ciente das penalidades legais a que estou sujeito(a):

Crime de Falsidade Ideológica

Art. 299 - Omitir, em documento público ou particular, declaração que dele devia constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato juridicamente relevante:

Pena - reclusão, de 01 (um) a 05 (cinco) anos, e multa, se o documento é público, e reclusão de 01 (um) a 03 (três) anos, e multa, se o documento é particular.

Crime de Estelionato

Art. 171 - Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil, ou qualquer outro meio fraudulento:

Pena - reclusão, de 01 (um) a 05 (cinco) anos, e multa.

 

Assim sendo, por ser o aqui declarado a mais pura expressão da verdade, assino esta declaração para que surta seus efeitos legais.

 

 

__________________________, _____/_____/2025

Local Data

 

 

_______________________________________________

Assinatura do/a declarante

 

 

MODELO 4

DECLARAÇÃO DE PENSÃO ALIMENTÍCIA

 

Eu, _______________________________________________________________________, portador(a) do RG nº __________________, inscrito(a) no CPF ______________________________, nos termos do Edital Vigente DECLARO, para os devidos fins, que:

( ) Recebo pensão alimentícia no valor mensal de R$ _____(_________________________________), proveniente da guarda de _________________________________________________________________________________________________(nome do filho/a)

 

Declaro também estar ciente das penalidades legais a que estou sujeito(a):

Crime de Falsidade Ideológica

Art. 299 - Omitir, em documento público ou particular, declaração que dele devia constar, ou nele inserir ou fazer inserir declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato juridicamente relevante:

Pena - reclusão, de 01 (um) a 05 (cinco) anos, e multa, se o documento é público, e reclusão de 01 (um) a 03 (três) anos, e multa, se o documento é particular.

Crime de Estelionato

Art. 171 - Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro, mediante artifício, ardil, ou qualquer outro meio fraudulento:

Pena - reclusão, de 01 (um) a 05 (cinco) anos, e multa.

Assim sendo, por ser o aqui declarado a mais pura expressão da verdade, assino esta declaração para que surta seus efeitos legais.

 

 

__________________________, _____/_____/2025

Local Data

 

_________________________________________

Assinatura do/a declarante

 

 

MODELO 5

DECLARAÇÃO DE PERTENCIMENTO ÉTNICO E DE RESIDÊNCIA (PARA DISCENTE QUILOMBOLA OU INDÍGENA)

As lideranças comunitárias abaixo identificadas, da

( ) COMUNIDADE QUILOMBOLA _______________________________________(nome do Quilombo), OU

( ) COMUNIDADE INDÍGENA __________________________________________(nome da TRIBO)

DECLARAM, para fins de inscrição nos Programas da Assistência Estudantil que o(a) discente __________________________________________________________________(nome completo), cadastrado(a) no CPF sob o número____________________________(onze dígitos), pertencente à Comunidade___________________________________(nome do quilombo ou da tribo ao qual pertence) e reside, localizada no município ____________________________________, UF_____.

Por ser expressão da verdade, firmamos e datamos a presente declaração.

 

____________________________________________________

Local e data (Informar a Cidade, a UF e o dia, mês e ano da emissão).

 

LIDERANÇA 1

Nome completo

 
CPF:

 	
RG:

 
Assinatura

 
 

LIDERANÇA 2

Nome completo

 
CPF:

 	
RG:

 
Assinatura

 
 
LIDERANÇA 3

Nome completo

 
CPF:

 	
RG:

 
Assinatura

 
Obs 1: Esta declaração deverá ser utilizada para fins de comprovante de residência do discente:


	
comunidade quilombola, quando a Fundação Cultural Palmares não declarar ou


	

	
comunidade indígena, quando a FUNAI não declarar


	
Obs 2: Se os líderes ou alguns dos líderes signatários da declaração possuir algum vínculo com alguma entidade representativa da comunidade, essa situação deverá ser identificada na declaração, mediante a indicação do nome e aposição do carimbo do CNPJ da entidade a qual representa.

 
 `;

            var edital87 = `Edital N°87, de 20 de setembro de 2024 PROCESSO SELETIVO IFPR 2025 - CURSOS TÉCNICOS INTEGRADOS AO ENSINO MÉDIO

                    	O Reitor do Instituto Federal de Educação, Ciência e Tecnologia do Paraná, no uso da competência que lhe confere o Decreto de 06 de fevereiro de 2024, publicado no Diário Oficial da União no dia 07 de fevereiro de 2024, seção 2, página 01, torna público as normas que regem o Processo Seletivo IFPR 2025 para ingresso nos Cursos Técnicos Integrados ao Ensino Médio, na modalidade presencial, ofertados para o ano de 2025, considerando a política de inclusão do IFPR para o ingresso de estudantes nos cursos. As inscrições estarão abertas de 03 de outubro a 01 de novembro de 2024.

                    	BASE LEGAL

                    	Lei nº 9.394, de 20 de dezembro de 1996 - Estabelece as diretrizes e bases da educação nacional.

                    	Decreto nº 3.298, de 20 de dezembro de 1999 - Regulamenta a Lei no 7.853, de 24 de outubro de 1989, dispõe sobre a Política Nacional para a Integração da Pessoa Portadora de Deficiência, consolida as normas de proteção, e dá outras providências.

                    	Decreto nº 5.296, de 02 de dezembro de 2004 - Regulamenta as Leis nos 10.048, de 8 de novembro de 2000, que dá prioridade de atendimento às pessoas que especifica, e 10.098, de 19 de dezembro de 2000, que estabelece normas gerais e critérios básicos para a promoção da acessibilidade das pessoas portadoras de deficiência ou com mobilidade reduzida, e dá outras providências.

                    	Decreto nº 6.593/2008 - Regulamenta o art. 11 da Lei no 8.112, de 11 de dezembro de 1990, quanto à isenção de pagamento de taxa de inscrição em concursos públicos realizados no âmbito do Poder Executivo federal.

                    	Lei nº 12.711, de 29 de agosto de 2012 - Dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio e dá outras providências.

                    	Lei nº 12.764, de 27 de dezembro de 2012 - Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista; e altera o § 3º do art. 98 da Lei nº 8.112, de 11 de dezembro de 1990.

                    	Decreto nº 7.824, de 11 de outubro de 2012 - Regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

                    	Lei nº 13.146, de 06 de julho de 2015 - Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).

                    	Lei nº 13.409, de 28 de dezembro de 2016 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre a reserva de vagas para pessoas com deficiência nos cursos técnico de nível médio e superior das instituições federais de ensino.

                    	Decreto nº 9.034, de 20 de abril de 2017 - Altera o Decreto n º 7.824, de 11 de outubro de 2012, que regulamenta a Lei n º 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

                    	Lei nº 14.126 de 22 de março de 2021 - Classifica a visão monocular como deficiência sensorial, do tipo visual.

                    	Decreto nº 11.016/2022 - Regulamenta o Cadastro Único para Programas Sociais do Governo Federal, instituído pelo art. 6º-F da Lei nº 8.742, de 7 de dezembro de 1993.

                    	Lei nº 14.723 de 13 de novembro de 2023 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre o programa especial para o acesso às instituições federais de educação superior e de ensino técnico de nível médio de estudantes pretos, pardos, indígenas e quilombolas e de pessoas com deficiência, bem como daqueles que tenham cursado integralmente o ensino médio ou fundamental em escola pública.

                    	Decreto nº 11.781 de 14 de novembro de 2023 - Altera o Decreto nº 7.824, de 11 de outubro de 2012, que regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

                    	Decreto Nº 11.864, de 27 de dezembro de 2023 - Dispõe sobre o valor do salário mínimo a vigorar a partir de 1º de janeiro de 2024.

                    	Portaria Normativa MEC nº 18, de 11 de outubro de 2012 - Dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei no 12.711, de 29 de agosto de 2012, e o Decreto no 7.824, de 11 de outubro de 2012.

                    	Portaria Normativa nº 2.027 de 16 de novembro de 2023 - Altera a Portaria Normativa MEC nº 18, de 11 de outubro de 2012, que dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei nº 12.711, de 29 de agosto de 2012, e a Portaria Normativa MEC nº 21, de 5 de novembro de 2012, que dispõe sobre o Sistema de Seleção Unificada - Sisu.

                    	Resolução Consup/IFPR nº 190/2024 – Dispõe sobre a Organização Didático-Pedagógica dos Cursos Técnicos de Nível Médio na modalidade presencial do Instituto Federal de Educação, Ciência e Tecnologia do Paraná.

                    	Resolução Consup/IFPR nº 55/2011 – Dispõe sobre a Organização Didático Pedagógica da Educação Superior no âmbito do Instituto Federal do Paraná – IFPR.

                    	DAS DISPOSIÇÕES PRELIMINARES

                    	1.1. Os Cursos Técnicos Integrado ao Ensino Médio, objeto deste certame, são públicos, gratuitos e presenciais, devendo o(a) candidato(a) ter disponibilidade de tempo para realizar atividades no contraturno e/ou aos sábados, conforme o calendário acadêmico do campus e o projeto pedagógico do curso.

                    	1.1.1 Para acessar tutoriais em vídeo sobre o processo seletivo (com acessibilidade), utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/tutoriais/.

                    	1.1.2 Para acessar formulários e outros documentos editáveis, utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/documentos/.

                    	1.1.3 Para acessar o Portal do Candidato do IFPR, utilize o endereço eletrônico https://portaldocandidato.ifpr.edu.br/.

                    	1.2. Ao término do curso, o estudante fará jus, com apenas uma matrícula, ao diploma de Ensino Médio com uma habilitação profissional técnica.

                    	1.3. Para ingresso nos Cursos Técnicos Integrados ao Ensino Médio o candidato deverá ter concluído, imprescindivelmente, o Ensino Fundamental e ter, no máximo, 17 anos, até a data da matrícula.

                    	1.4. O processo seletivo será realizado em uma única etapa, que consistirá na classificação do(a) candidato(a) pelo seu desempenho (notas/conceitos) nas disciplinas de Língua Portuguesa e Matemática do 7º (sétimo) e do 8º (oitavo) anos do Ensino Fundamental, conforme indicado no item 6, deste Edital.

                    	1.4.1. Para os candidatos aos cursos técnicos integrados ao Ensino Médio que tenham cursado o Ensino Fundamental em outro país será considerada a nota/conceito obtido na língua materna do país de origem, em substituição a Língua Portuguesa.

                    	1.5 É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação de todos os atos, editais e comunicados referentes ao Processo Seletivo regido por este edital.

                    	1.6 O(A) candidato(a) que se inscrever pelo Sistema de Ações Afirmativas (cotas) automaticamente autoriza a divulgação dos resultados do Processo Seletivo referente a este edital de acordo com a classificação gerada pelo Sistema de Ações Afirmativas (cotas), nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023.

                    	1.7 O(A) candidato(a) deverá possuir Carteira de Identidade(CI) e CPF para participar do referido processo seletivo.

                    	1.8 Serão considerados documentos de identificação: Carteira de Identidade expedida pelas Secretarias de Segurança Pública, pelas Forças Armadas Brasileiras, por países que possuem acordos diplomáticos com o Brasil, Polícias Militares, Ordens ou Conselhos que, por Lei Federal, tenha validade como documento de identidade e possibilite a conferência da foto e da assinatura; Carteira de Identidade Nacional - CIN; Carteira de Trabalho e Previdência Social(CTPS); Passaporte; ou Carteira Nacional de Habilitação com fotografia – na forma da Lei nº 9.503/97 e o Documento de Identidade Nacional de Estrangeiro (Carteira de Registro Nacional Migratório - CRNM).

                    	1.8.1. A CTPS Digital apenas tem validade como documento para fins de acompanhamento do contrato de trabalho, não sendo válida como documento de identificação.

                    	1.9 Ao se inscrever para este Processo Seletivo, o(a) candidato(a) declara conhecer e aceitar todas as condições descritas neste edital. Declara, ainda, estar ciente de que qualquer omissão ou falsidade, bem como o não atendimento das exigências impostas, culminará com a sua desclassificação do processo.

                    	DA FORMA DE OFERTA

                    	2.1 Os Cursos Técnicos Integrados ao Ensino Médio ofertados neste Edital, na modalidade presencial, são caracterizados pelas formas de oferta integrada – oferecida a quem já tenha concluído o Ensino Fundamental. Os cursos são organizados de modo que o estudante, a partir de única matrícula no IFPR, conclua o Ensino Médio juntamente a uma habilitação profissional técnica de nível médio.

                    	2.1.1. O calendário letivo, com datas de início e término do ano letivo, será divulgado no site de cada câmpus do IFPR, considerando suas especificidades.

                    	DOS CURSOS E VAGAS

                    	3.1 A distribuição das vagas nos diversos cursos e campi do IFPR e nas diferentes ações afirmativas (cotas de inclusão) e ampla concorrência encontram-se, respectivamente, no Anexo I e no Anexo II deste Edital.

                    	3.2 O total das vagas ofertadas para cada curso e turma será disponibilizado da seguinte forma:

                    	3.2.1 60% (sessenta por cento) do total das vagas ofertadas para cada curso e turma, para cursos com forma de oferta integrada, são reservadas aos candidatos que tenham cursado integralmente o Ensino Fundamental em escolas públicas do Brasil, em cursos regulares ou no âmbito da modalidade de Educação de Jovens e Adultos (EJA), ou tenham obtido certificado de conclusão com base no resultado do exame nacional para certificação de competências de jovens e adultos(Encceja) ou de exames de certificação de competência ou de avaliação de jovens e adultos realizados pelos sistemas estaduais de ensino. Esse percentual será distribuído da seguinte maneira:

                    	3.2.1.1 50% (cinquenta por cento) serão destinados aos candidatos que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário - mínimo nacional per capita (R$ 1.412,00), havendo reserva de vagas para candidatos:

                    	3.2.1.1.1 BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas.

                    	3.2.1.1.2 BR-EP-Q - Autodeclarados quilombolas.

                    	3.2.1.1.3 BR-EP-PCD - Pessoas com deficiência.

                    	3.2.1.1.4 BR-EP - Demais candidatos.

                    	3.2.1.2 50% (cinquenta por cento) serão destinados aos candidatos que, independentemente de renda familiar, havendo reserva de vagas para candidatos:

                    	3.2.1.2.1 EP-PPI - Autodeclarados pretos, pardos ou indígenas.

                    	3.2.1.2.2 EP-Q - Autodeclarados quilombolas.

                    	3.2.1.2.3 EP-PCD - Pessoas com deficiência.

                    	3.2.1.2.4 EP - Demais candidatos

                    	3.3.1 IFPR-PPI - 10% (dez por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos autodeclarados pretos, pardos ou indígenas.

                    	3.3.2 IFPR-PCD - 5% (cinco por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos com deficiência.

                    	3.3.3 25% (vinte por cento) do total das vagas ofertadas para cada curso e turma são reservadas à Ampla Concorrência (AC). Nesta forma de oferta estão incluídos estudantes que estudaram qualquer tempo em escolas particulares mesmo sendo bolsistas.

                    	3.4 Os Processos Seletivos do IFPR realizam reserva de vagas através do Sistema de Ações Afirmativas (cotas), estabelecidas nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023 mediante a comprovação das respectivas condições por meio de documentos.

                    	3.4.1 O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, segue o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas ações afirmativas (cotas), bem como a ampla concorrência não atendam exatamente os percentuais indicados.

                    	3.4.2 A base para a distribuição de vagas em cada ação afirmativa (cota) e na Ampla Concorrência encontra-se no Anexo II deste edital.

                    	3.4.3. Candidatos(as) estrangeiros, que não sejam naturalizados, ou que tenham feito parte de seu estudo no exterior, não poderão participar do processo seletivo na reserva de vagas para estudantes de escola pública, devendo, portanto, responder NÃO à pergunta de número 1 (um) do Questionário Socioeconômico no momento da inscrição.

                    	3.5. As ações afirmativas às quais o(a) candidato(a) poderá concorrer durante o processo seletivo serão definidas mediante preenchimento de questionário socioeconômico, durante a realização da inscrição.

                    	3.5.1. O questionário socioeconômico a que se refere o item 3.5 possuirá as seguintes questões:

                    	a) QUESTÃO 01 - Você concluiu TODA a etapa de ensino anterior à modalidade de curso para a qual está se inscrevendo em uma instituição pública?

                    	b) QUESTÃO 02 - De acordo com as condições estabelecidas no edital do processo seletivo, a sua renda per capta familiar é igual ou inferior a 1 salário mínimo atualmente? (Renda familiar per capita é calculada dividindo-se o total de renda familiar pelo número de moradores de uma residência).

                    	c) QUESTÃO 03 - Você se identifica como pessoa preta, parda ou indígena?

                    	d) QUESTÃO 04 - Você é membro ou reside em alguma comunidade remanescente de quilombo?

                    	e) QUESTÃO 05 - Você possui alguma deficiência que se enquadra nas condições estabelecidas no edital do processo seletivo para o qual está se inscrevendo e que pode ser comprovada por meio de laudo médico?

                    	3.6. As vagas da Ampla Concorrência são destinadas a todos(as) os(as) candidatos(as) que se julgarem aptos(as) a participar do certame, independentemente da condição social, racial, de deficiência ou de terem cursado o ensino fundamental em escola pública ou privada.

                    	3.7. Quando ocorrer a existência de vagas em uma determinada ação afirmativa (cota) e a falta de candidatos inscritos para ocupá-las, ocorrerá a convocação de candidatos de outras listas de concorrência, a partir da migração da referida vaga, respeitando a ordem constante no Anexo III.

                    	DO SISTEMA DE AÇÕES AFIRMATIVAS (COTAS)

                    	4.1 Cotas para Escola Pública

                    	4.1.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de escola pública devem apresentar, no momento da matrícula, histórico escolar por meio do qual comprovem ter cursado e concluído todo o ensino fundamental (1º ao 9º anos ou outra forma prevista em Lei) exclusivamente na rede pública de ensino do Brasil.

                    	4.1.2. Não poderá ser matriculado(a), nas vagas reservadas para as ações Afirmativas (cotas) de Escola Pública, o(a) candidato(a) que tenha cursado o ensino fundamental, integralmente ou em parte, em escolas particulares, inclusive com bolsa de estudos parcial ou integral (Art. 5º, Inciso II b, § 1º da Portaria Normativa nº 18 de 2012). Identificadas disciplinas isoladas realizadas na rede privada de ensino, o(a) candidato(a) também estará impossibilitado(a) de se matricular nestas vagas.

                    	4.1.3. De acordo com o Art. 19, inciso I da Lei nº 9.394, de 20 de dezembro de 1996, considera-se Escola Pública a instituição criada ou incorporada, mantida e administrada pelo poder público. As escolas pertencentes ao Sistema S (SENAI, SESI, SENAC), escolas conveniadas, escolas filantrópicas ou, ainda, fundações ou instituições similares (mesmo que mantenham educação gratuita) não são consideradas instituições da rede pública de ensino.

                    	4.1.4 Caso, no momento da matrícula, o documento a que se refere o item 4.1.1 não seja apresentado ou não comprove a condição de o estudante ter realizado todo o Ensino Fundamental em escola pública, requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

                    	4.1.4.1 Ocorrendo a situação prevista no item 4.1.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VIII que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

                    	4.1.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.1.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

                    	4.2. Cotas para Baixa Renda

                    	4.2.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de Baixa Renda deverão comprovar renda familiar bruta igual ou inferior a 1(um) salário-mínimo per capita (equivalente a R$ 1.412,00, de acordo com o DECRETO Nº 11.864, DE 27 DE DEZEMBRO DE 2023).

                    	4.2.2. Para atendimento da condição de baixa renda, deve-se considerar:

                    	a) Família: a unidade nuclear composta por uma ou mais pessoas, eventualmente ampliada por outras pessoas que contribuam para o rendimento ou tenham suas despesas atendidas por aquela unidade familiar, todas moradoras em um mesmo domicílio;

                    	b) Morador: a pessoa que tem o domicílio como local habitual de residência e nele reside na data de inscrição do estudante no processo seletivo da instituição federal de ensino;

                    	c) Renda familiar bruta mensal: a soma dos rendimentos brutos auferidos por todas as pessoas da família, calculada na forma do disposto no Art. 7º da Portaria Normativa nº 18/2012 do MEC.

                    	d) Renda familiar bruta mensal per capita: a razão entre a renda familiar bruta mensal e o total de pessoas da família, calculada na forma do art. 7º da Portaria Normativa Nº 18, de 11 de outubro de 2012 - MEC.

                    	4.2.3. No momento da matrícula, os documentos comprobatórios para análise da renda deverão ser referentes aos 3 meses anteriores ao período de inscrições (julho, agosto e setembro de 2024).

                    	4.2.3.1 Os documentos a que se refere o item 4.2.3 constam no Anexo VII e deverão ser enviados, em um único arquivo, através do Portal do Candidato do IFPR no item “Documentos Comprobatórios de Renda”.

                    	4.2.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

                    	4.2.4.1 Ocorrendo a situação prevista no item 4.2.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VIII que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

                    	4.2.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.2.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

                    	4.3 Cotas para Pretos, Pardos ou Indígenas

                    	4.3.1. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa de Pretos, Pardos ou Indígenas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

                    	4.3.2. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

                    	4.3.2.1. Para os candidatos autodeclarados indígenas, quando convocados para a heteroidentificação, deverão apresentar:

                    	a) cópia digitalizada do RANI (Registro de Nascimento Indígena); e/ou

                    	b) declaração de residência/pertencimento à comunidade indígena assinada por 3 (três) autoridades indígenas, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo X; e/ou

                    	c) histórico escolar emitido por escola indígena.

                    	4.3.2.2 As demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

                    	4.3.3. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa preta, parda ou indígena, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas pretas, pardas ou indígenas.

                    	4.4 Cotas para Pessoa com Deficiência

                    	4.4.1. Considerar-se-á Pessoa com Deficiência (PcD) aquela que possui impedimento de longo prazo, de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade em igualdade de condições com as demais pessoas, conforme artigo 2º da Lei nº 13.146, de 06 de julho de 2015, e a pessoa com transtorno do espectro autista, de acordo com art. 1º, § 2 o da Lei nº 12.764, de 27 de dezembro de 2012.

                    	4.4.2. Os(As) candidatos(as) inscritos(as) pelo Sistema de Ações Afirmativas (cota) Pessoa com Deficiência deverão se enquadrar:

                    	a) No art. 4º do Decreto nº 3.298, de 20 de dezembro de 1999, atualizado pelo art. 5º, § 1º, inciso I, do Decreto nº 5.296, de 02 de dezembro de 2004, o qual apresenta as seguintes definições:

                    	I - deficiência física: alteração completa ou parcial de um ou mais segmentos do corpo humano, acarretando o comprometimento da função física, apresentando-se sob a forma de paraplegia, paraparesia, monoplegia, monoparesia, tetraplegia, tetraparesia, triplegia, triparesia, hemiplegia, hemiparesia, ostomia, amputação ou ausência de membro, paralisia cerebral, nanismo, membros com deformidade congênita ou adquirida, exceto as deformidades estéticas e as que não produzam dificuldades para o desempenho de funções;

                    	II - deficiência auditiva: perda bilateral, parcial ou total, de quarenta e um decibéis (dB) ou mais, aferida por audiograma nas frequências de 500Hz, 1.000Hz, 2.000Hz e 3.000Hz;

                    	III - deficiência visual: cegueira, na qual a acuidade visual é igual ou menor que 0,05 no melhor olho, com a melhor correção óptica; a baixa visão, que significa acuidade visual entre 0,3 e 0,05 no melhor olho, com a melhor correção óptica; os casos nos quais a somatória da medida do campo visual em ambos os olhos for igual ou menor que 60º; ou a ocorrência simultânea de quaisquer das condições anteriores; visão monocular como deficiência sensorial, do tipo visual (conforme definido na lei nº 14.126 de 22 de março de 2021) .

                    	IV - deficiência intelectual: funcionamento intelectual significativamente inferior à média, com manifestação antes dos dezoito anos e limitações associadas a duas ou mais áreas de habilidades adaptativas, tais como: 1. comunicação; 2. cuidado pessoal; 3. habilidades sociais; 4. utilização dos recursos da comunidade; 5. saúde e segurança; 6. habilidades acadêmicas; 7. lazer; e 8. trabalho;

                    	V - deficiência múltipla - associação de duas ou mais deficiências.

                    	b) No art. 1º, § 1º, incisos I e II, e § 2º, da Lei nº 12.764, de 27 de dezembro de 2012, que apresenta as seguintes definições acerca do Transtorno do Espectro Autista: § 1º Para os efeitos desta Lei, é considerada pessoa com transtorno do espectro autista aquela portadora de síndrome clínica caracterizada na forma dos seguintes incisos I ou II:

                    	I - deficiência persistente e clinicamente significativa da comunicação e da interação sociais,manifestada por deficiência marcada de comunicação verbal e não verbal usada para interação social; ausência de reciprocidade social; falência em desenvolver e manter relações apropriadas ao seu nível de desenvolvimento;

                    	II - padrões restritivos e repetitivos de comportamentos, interesses e atividades, manifestados por comportamentos motores ou verbais estereotipados ou por comportamentos sensoriais incomuns; excessiva aderência a rotinas e padrões de comportamento ritualizados; interesses restritos e fixos. § 2º A pessoa com transtorno do espectro autista é considerada pessoa com deficiência, para todos os efeitos legais.

                    	4.4.3. O(A) candidato(a) aprovado(a) nas vagas reservadas para Pessoas com Deficiência deverá apresentar, no momento da matrícula através do Portal do Candidato do IFPR, laudo médico assinado por médico responsável que ateste alguma das condições descritas no item 4.4.2.

                    	4.4.3.1. O laudo médico deverá:

                    	a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

                    	b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no item 4.4.2;

                    	c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

                    	4.4.3.2. O(A) candidato(a) inscrito(a) nas vagas reservadas para Pessoas com Deficiência autoriza a utilização pelo IFPR do laudo médico entregue no momento da matrícula.

                    	4.4.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

                    	4.4.4.1 Ocorrendo a situação prevista no item 4.4.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VIII que deverá ser preenchido e enviado ao e-mail: recursos@ifpr.edu.br.

                    	4.4.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.4.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

                    	4.4.5. Caso seja constatada inexatidão ou irregularidade de informações, ainda que posteriormente ao processo seletivo e/ou à matrícula, o(a) candidato(a) será eliminado(a) do Processo Seletivo, declarando-se nulos todos os atos decorrentes de sua inscrição.

                    	4.5 Cotas para Quilombolas

                    	4.5.1. Os(As) candidatos(as) inscritos(as) pela ação afirmativa destinada a quilombolas são aqueles que comprovem residência/pertencimento às comunidades remanescentes de quilombo.

                    	4.5.2. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa para quilombolas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

                    	4.5.3. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

                    	4.5.4. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa quilombola, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas quilombolas.

                    	4.5.5. O(A) candidato(a) autodeclarado Quilombola, quando da convocação para a heteroidentificação, deverá apresentar, obrigatoriamente, os seguintes documentos:

                    	a) Autodeclaração étnico-racial devidamente preenchida e assinada (disponível aqui);

                    	b) Cópia frente e verso de documento de identificação com foto;

                    	c) Declaração de residência/pertencimento às comunidades remanescentes de quilombo assinada por 3 (três) autoridades de Associação Quilombola reconhecida pela Fundação Palmares, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo XI.

                    	4.5.6. As comunidades remanescentes de quilombos são apenas aquelas certificadas pela Fundação Cultural Palmares, nos termos do Decreto 4.887/03, de 20/11/2003.

                    	4.5.7. Demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

                    	4.6. Todos os(as) candidatos(as) optantes pelo Sistema de Ações Afirmativas (cotas) concorrerão, primeiramente, na Ampla Concorrência e, se não classificados, concorrerão em seu respectivo grupo de Ações Afirmativas (cotas), de acordo com a sequência de prioridades abaixo:

                    	a) IFPR-PPI - candidatos autodeclarados pretos, pardos ou indígenas, independentemente de renda familiar e de ter cursado a etapa anterior em escola pública.

                    	b) IFPR-PCD - candidatos com deficiência, independentemente de renda familiar e de ter cursado a etapa anterior integralmente em escola pública.

                    	c) EP - estudantes que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	d) EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	e) EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	f) EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	g) BR-EP - candidatos que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	h) BR-EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	i) BR-EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	j) BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	4.7 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) constarão apenas na lista geral da Ampla Concorrência, não precisando fazer qualquer comprovação quanto às ações afirmativas para as quais foi previamente classificado.

                    	Cronograma do Processo Seletivo
O cronograma do Processo Seletivo, disponível no site institucional, segue as seguintes etapas:
Publicação do Edital: 20/09/2024
Inscrições:
Período de inscrição on-line: 01/11/2024 a 03/10/2024.
Período de isenção de taxa de inscrição: 03/10/2024 a 25/10/2024.
Divulgação da Relação Nominal com resultado preliminar do pedido de isenções concedidas: 30/10/2024.
Prazo para interposição de recursos contra Relação Nominal com resultado do pedido de isenções concedidas: 31/10/2024.
Divulgação da Relação Nominal com resultado definitivo do pedido de isenções concedidas: 04/11/2024.
Prazo final para pagamento da taxa de inscrição: 06/11/2024.
Homologação das Inscrições:
Publicação da lista preliminar das inscrições homologadas no Processo Seletivo: 13/11/2024.
Prazo para interposição de recurso referente à homologação de inscrições: 14/11/2024.
Análise dos recursos contra o Resultado da lista preliminar dos inscritos no Processo Seletivo: 18/11/2024.
Publicação final das inscrições homologadas: 19/11/2024.
Classificação e Resultados:
Análise dos históricos: 19/11/2024 a 27/11/2024.
Publicação da classificação preliminar: 28/11/2024.
Prazo para interposição de recurso referente à classificação preliminar: 29/11/2024.
Publicação do resultado dos recursos referentes à classificação preliminar: 03/12/2024.
Heteroidentificação e Ações Afirmativas:
Convocação dos candidatos inscritos nas vagas das ações afirmativas/cotas sociais para realização do processo de heteroidentificação e entrega de documentos para comprovação da condição de cotista: 05/12/2024.
Bancas de heteroidentificação e análise pelas comissões dos documentos entregues: 05/12/2024 a 16/12/2024.
Publicação do resultado preliminar da heteroidentificação e análise documental: 17/12/2024.
Prazo para interposição de recurso contra o resultado preliminar da heteroidentificação e análise documental: 19/12/2024.
Análise dos recursos pela Coordenação de Ações Inclusivas e comissão recursal de heteroidentificação: 20/12/2024.
Publicação do resultado final do processo de heteroidentificação: 23/12/2024.
Resultados Finais e Matrículas:
Publicação do Resultado Final do Processo Seletivo: 23/12/2024.
Convocação para matrícula da 1ª chamada: 20/01/2025.
Período de matrícula para os candidatos convocados na 1ª chamada: 24/01/2025 a 24/01/2025.
Divulgação do resultado provisório das matrículas: 28/01/2025.
Prazo para recurso contra o resultado provisório das matrículas: 29/01/2025.
Divulgação do resultado definitivo das matrículas: 31/01/2025.


                    	DAS INSCRIÇÕES

                    	6.1 As inscrições devem ser feitas através do Portal do Candidato do IFPR que pode ser acessado através link https://portaldocandidato.ifpr.edu.br/.

                    	6.1.1 Para fazer seu login no Portal do Candidato do IFPR, o candidato deverá utilizar sua conta pessoal gov.br.

                    	6.1.2 Caso não possua conta gov.br, o candidato deverá realizar o seu cadastro, conforme tutorial que pode ser acessado a partir do link dos vídeos tutoriais disponível no item 1.1.1.

                    	6.2 A inscrição do(a) candidato(a) implicará ciência e aceitação das normas e condições estabelecidas no inteiro teor deste edital, das quais não poderá alegar desconhecimento.

                    	6.3 No ato da inscrição, o(a) candidato(a) deverá realizar integralmente o procedimento de inscrição, de modo a:

                    	a) responder ao questionário a que se refere o item 3.5.1 deste Edital;

                    	b) conferir e confirmar as ações afirmativas para as quais estará concorrendo;

                    	c) preencher todos os demais dados solicitados;

                    	d) informar a média de Língua Portuguesa e de Matemática, relativas aos 7º e 8º anos do Ensino Fundamental, conforme o histórico escolar apresentado ou conforme exame nacional para certificação de competências de jovens e adultos (Encceja).

                    	e) realizar o upload do comprovante oficial de notas do Ensino Fundamental;

                    	f) confirmar a inscrição.

                    	6.4 O(A) candidato(a) deverá seguir as orientações dispostas no Anexo IV para indicar a sua média.

                    	6.4.1 Para a indicação da média dos componentes curriculares Língua Portuguesa e Matemática devem ser considerados o sétimo e oitavo anos, como disposto no ANEXO IV.

                    	6.4.2 Nos casos em que o histórico escolar expressa os resultados através de conceitos ou quaisquer outras formas de indicação, o(a) candidato(a) deverá utilizar a seguinte tabela de conversão:

                    	A indicação de aprendizagem é definida de acordo com a nota obtida, seguindo a seguinte escala:

Nota 10,00: A ou A+ (Aprovado)

Nota 9,00: A- (Aprovado)

Nota 8,50: B ou B+ (Aprovado)

Nota 7,50: B- (Aprovado)

Nota 7,00: C ou C+ (Aprovado)

Nota 6,00: C- (Aprovado)

É importante destacar que todas as notas acima de 6,00 são consideradas "Aprovado".

                    	6.4.3 Na modalidade Ensino Fundamental via Certificação do Encceja (Exame Nacional para Certificação de Competências de Jovens e Adultos), o(a) candidato(a) deverá considerar a pontuação obtida nas áreas de conhecimento Linguagens, Códigos e suas Tecnologias e Matemática e suas Tecnologias.

                    	6.5 O(A) candidato(a) deve atentar-se ao correto preenchimento dos campos de notas e médias, conforme orientações do Anexo IV, a depender do caso.

                    	6.6 As informações fornecidas no formulário de inscrição e o seu correto preenchimento são de responsabilidade do(a) candidato(a), dispondo o IFPR do direito de excluir do processo de ingresso aquele que não preencher a solicitação de inscrição de forma completa e correta, bem como aquele que fornecer dados comprovadamente inverídicos.

                    	6.7 Após o preenchimento dos formulários o candidato deverá realizar o pagamento da taxa no valor de R$30,00 (trinta reais) ou solicitar a isenção de inscrição.

                    	6.7.1 Para realizar o pagamento da taxa de inscrição, o candidato deverá gerar, no Portal do Candidato do IFPR, boleto de pagamento em nome da FUNTEF-PR - Fundação de Apoio à UTFPR.

                    	6.7.2 Caso o candidato solicite isenção do valor da inscrição, deverá seguir as instruções constantes no item 7 do Edital.

                    	6.7.2.1 Em caso de indeferimento no pedido de isenção, o candidato deverá pagar a taxa de inscrição, conforme dispõe os itens 6.6 e 6.6.1, respeitados os prazos constantes no cronograma deste edital.

                    	DAS ISENÇÕES DE TAXA DE INSCRIÇÃO

                    	7.1 A solicitação de isenção da taxa de inscrição se dará conforme o disposto no Decreto nº 6.593/2008.

                    	7.2. São requisitos para o(a) candidato(a) solicitar a isenção de pagamento da taxa de inscrição:

                    	a) estar inscrito(a) no Cadastro Único para Programas Sociais do Governo Federal (CadÚnico);

                    	b) conforme disposto no Decreto nº 11.016/2022, ter perfil de família com renda mensal per capita (por pessoa) de até meio salário mínimo (R$ 706,00).

                    	7.3. Para solicitar a isenção da taxa de inscrição, o(a) candidato(a) deverá realizar os seguintes procedimentos:

                    	a) realizar sua inscrição no Portal do Candidato, conforme descrito no item 6.1;

                    	b) preencher o formulário de requerimento de isenção, disponível no Anexo VI. O formulário deverá ser assinado pelo(a) responsável do(a) candidato(a);

                    	c) providenciar os documentos comprobatórios solicitados no Anexo VI;

                    	d) digitalizar a carteira de identificação (CI) com foto do(a) candidato(a);

                    	e) enviar o formulário, a digitalização da carteira de identificação e os demais documentos comprobatórios no local indicado no Portal do Candidato.

                    	7.3.1. Serão aceitos os documentos enviados até a data limite para solicitar a isenção, definida no cronograma do item 5 deste edital.

                    	7.3.2. Candidatos(as) oriundos(as) da mesma família deverão preencher o formulário de requerimento de forma individual.

                    	7.3.3. Não será permitido o envio de quaisquer itens/documentos por correio postal ou e-mail que não seja o formulário online disponível no Portal do Candidato.

                    	7.4. Terá o seu requerimento de isenção da taxa de inscrição indeferido o(a) candidato(a) que:

                    	a) não apresentar, de forma completa, a documentação exigida no item 7.3;

                    	b) preencher de forma incorreta o formulário de requerimento (Anexo VI).

                    	7.5. A análise das solicitações será executada pela Equipe de Assessoramento do Processo Seletivo 2025 do IFPR, que irá avaliar as informações prestadas no formulário de requerimento e demais documentos anexados.

                    	7.5.1. O resultado das solicitações será publicado conforme data definida no cronograma do item 5 deste edital.

                    	7.6 Caso o candidato tenha entregado os documentos corretos, mas por algum motivo seu pedido tenha sido indeferido ele poderá fazer recurso através do formulário (Anexo VIII) e enviá-lo através do e-mail recursos@ifpr.edu.br.

                    	7.6.1. O recurso será avaliado pela Equipe de Assessoramento do Processo Seletivo 2025 do IFPR.

                    	7.7. A concessão de isenção da taxa de inscrição é pessoal e intransferível.

                    	7.8. O(A) candidato(a), cuja solicitação de isenção da taxa de inscrição for indeferida, deverá realizar o pagamento da taxa de inscrição, até a data limite, conforme orientações contidas nos itens 6.7 e 6.8.

                    	DA CLASSIFICAÇÃO

                    	8.1 A classificação será realizada em ordem decrescente da média gerada a partir das notas de Língua Portuguesa e Matemática informadas pelos(as) candidatos(as).

                    	8.1.1 A média a que se refere o item 8.1 se dará numa escala de 0,00 (zero vírgula zero) a 10,00 (dez vírgula zero) e será calculada automaticamente pelo Portal do Candidato a partir das notas lançadas pelo(a) candidato(a).

                    	8.1.2 Todos(as) os(as) candidatos(as) constarão na lista de classificação da Ampla Concorrência.

                    	8.1.3 Além da lista da Ampla Concorrência, os(as) candidatos(as) constarão nas listas de todas as ações afirmativas as quais tenham sido enquadrados conforme item 3.5 deste edital.

                    	8.1.4 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) serão classificados(as) apenas na lista geral da Ampla Concorrência.

                    	8.2 No caso de empate, será considerada a seguinte regra para o desempate:

                    	a) maior idade; e

                    	b) persistindo o empate, sorteio.

                    	8.3 Anteriormente à publicação da classificação preliminar, as médias e notas informadas serão conferidas com o comprovante oficial de notas submetido no formulário de inscrição.

                    	8.3.1 Se constatado divergência nas notas ou média informada, devido ao não atendimento das orientações do Anexo IV, a média do(a) candidato(a) poderá ser recalculada pela Equipe de Assessoramento, para que sejam atendidas na íntegra as referidas orientações.

                    	8.3.2 Se constatados equívocos na média ou notas informadas pelo candidato, a média final do(a) candidato(a) será ajustada com o valor correto.

                    	8.3.2.1 Caso o documento oficial contendo as notas impossibilite a devida conferência, a nota do(a) candidato(a) será definida como 0 (zero).

                    	DOS RESULTADOS

                    	9.1. O resultado preliminar do Processo Seletivo será divulgado em data definida pelo cronograma disponível no item 5 deste edital, no Portal do Candidato (https://portaldocandidato.ifpr.edu.br/).

                    	9.2. Caberá recurso contra a classificação preliminar. O recurso deverá ser protocolado de forma online através do Portal do Candidato (https://portaldocandidato.ifpr.edu.br/) em datas definidas no cronograma disponível no item 5 deste edital.

                    	9.2.2. A Equipe de Assessoramento do Processo Seletivo 2025 do IFPR avaliará as informações prestadas no formulário de recurso referente à classificação, deferindo ou não o pedido.

                    	9.3. O resultado final será constituído da lista geral de classificação pela ampla concorrência e por cada uma das ações afirmativas (cotas), para cada campus e curso.

                    	9.3.1. A lista geral de classificação em cada uma das ações afirmativas poderá sofrer alterações durante o processo de heteroidentificação e da análise dos documentos de matrícula dos(as) candidatos(as) inscritos(as) nas ações afirmativas de Baixa Renda, PcD e Escola Pública.

                    	9.4. Respeitado o disposto no item 4.6 deste edital, os candidatos aprovados dentro das vagas previstas, serão convocados para matrícula em primeira chamada.

                    	9.4.1 Após as matrículas a que se refere o item 9.4 e que estão descritas no título 10, poderão ocorrer chamadas complementares, caso algum candidato previamente convocado não confirme sua matrícula.

                    	DAS MATRÍCULAS

                    	10.1. A matrícula será permitida ao(à) candidato(a) que apresentar toda a documentação exigida e tenha concluído o Ensino Fundamental.

                    	10.2. A matrícula dos candidatos(as) aprovados(as) nas chamadas do Processo Seletivo ocorrerá respeitando as vagas disponíveis, a ordem de classificação estabelecida conforme resultado do Exame de Classificação e o Sistema de Ações Afirmativas (cotas).

                    	10.3. As matrículas dos(as) candidatos(as) aprovados(as) deverão ser realizadas de forma online, exclusivamente no Portal do Candidato do IFPR(https://portaldocandidato.ifpr.edu.br/), por meio do login na conta individual de cada candidato(a).

                    	10.3.1. O(A) candidato(a) deverá acessar o Portal do Candidato e realizar o upload dos documentos solicitados conforme o período definido no cronograma.

                    	10.4. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação do edital e as chamadas de candidatos(as) aprovados(as).

                    	10.5. O(A) candidato(a) que não realizar sua matrícula, conforme datas e definições do edital, perderá o direito à vaga, possibilitando que o(a) próximo(a) candidato(a) da lista de classificação seja convocado(a).

                    	10.5.1 Ocorrendo a situação prevista no item 10.5, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VII que deverá ser preenchido e enviado ao e-mail: recursos@ifpr.edu.br.

                    	10.6. Os documentos para matrícula, comuns a todos(as) os(as) candidatos(as), são:

                    	10.6.1 Carteira de identidade;

                    	10.6.1.1 Se candidato(a) estrangeiro(a), em substituição ao documento previsto no item 10.6.1, deve ser apresentado: documento de identidade nacional de estrangeiro (Carteira de Registro Nacional Migratório - CRNM) ou Residência Mercosul, emitida por autoridade brasileira, válida à data da matrícula;

                    	10.6.2 Certidão de nascimento ou Certidão de Casamento;

                    	10.6.3 Declaração de vacinação (para candidatos com menos de 18 (dezoito) anos) emitida e assinada por profissional de saúde, atestando que o adolescente está com o seu esquema vacinal de acordo com a recomendação estabelecida no Programa Nacional de Imunização – PNI, do Ministério da Saúde e da Secretaria de Estado da Saúde;

                    	10.6.4 Certificado de conclusão do Ensino Fundamental ou equivalente que comprove a conclusão do Ensino Fundamental;

                    	10.6.4.1 Poderá ser apresentada Declaração de Conclusão do Ensino Fundamental, desde que, num prazo de 60 (sessenta) dias, o histórico seja apresentado à Secretaria Acadêmica do campus;

                    	10.6.4.2 O candidato que realizou seus estudos em instituições estrangeiras, além da documentação e procedimentos definidos neste Edital, também deve entregar Comprovante de Conclusão de Ensino Fundamental, revalidado no Brasil na forma da lei.
                    	10.6.4.2.1 É dispensada a revalidação se o comprovante de conclusão de estudos pertencer a um país integrante do Mercosul.

                    	10.6.5 Formulário de Requerimento de Matrícula devidamente preenchido pelo responsável legal (conforme Anexo IX); e

                    	10.6.6 Documento de Identificação do Responsável Legal.

                    	10.7. Os documentos necessários para comprovação das Ações Afirmativas (cotas) de Baixa Renda, Pessoa com Deficiência e Escola Pública são:

                    	10.7.1 AÇÃO AFIRMATIVA DE ESCOLA PÚBLICA: Os candidatos devem apresentar, no momento da matrícula, Histórico Escolar por meio do qual comprovem ter cursado e concluído todo o ensino fundamental (1ª a 8ª séries – regime antigo –, 1º ao 9º anos – regime novo –, modalidade Educação de Jovens e Adultos – EJA; Exame Nacional para Certificação de Competências de Jovens e Adultos – ENCCEJA – ou outra forma prevista em Lei) exclusivamente na rede pública de ensino do Brasil.

                    	10.7.2 AÇÃO AFIRMATIVA DE PESSOA COM DEFICIÊNCIA: Laudo médico atestando a espécie e o grau da deficiência. O laudo deverá:

                    	a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

                    	b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no edital do processo seletivo;

                    	c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

                    	10.7.3 AÇÃO AFIRMATIVA DE BAIXA RENDA: documentos especificados no Anexo VII deste Edital.

                    	10.8 O estudante que ingressar mediante processo seletivo tendo efetuado seu registro acadêmico, deverá realizar a confirmação de sua matrícula devendo possuir frequência a pelo menos uma das aulas previstas para os 5 (cinco) primeiros dias letivos do calendário acadêmico do campus.

                    	10.8.1 A não realização da confirmação de matrícula pelo estudante ou de pessoa por ele autorizada para tal, caracterizar-se-á como desistência, o que ocasionará o cancelamento do seu registro acadêmico.

                    	DAS DISPOSIÇÕES FINAIS

                    	11.1. A Comissão Central do Processo Seletivo, a Equipe de Assessoramento do Processo Seletivo e o IFPR não se responsabilizam por solicitação de inscrição via internet não efetivada por motivos de ordem técnica, falhas de comunicação, congestionamento de linhas de comunicação ou quaisquer outros fatores de ordem técnica que impossibilitem a transferência dos dados ou a impressão de documentos.

                    	11.2. A inscrição do(a) candidato(a) implicará a aceitação total e incondicional das normas e instruções constantes neste edital.

                    	11.3. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação dos resultados das etapas do Processo Seletivo pelo Portal do Candidato do IFPR (https://portaldocandidato.ifpr.edu.br/).

                    	11.4. A inexatidão ou irregularidade de informações, ainda que constatada posteriormente ao processo seletivo e/ou à matrícula, eliminará o(a) candidato(a) do Processo de Seleção, declarando-se nulos todos os atos decorrentes de sua inscrição.

                    	11.5 Após esgotadas as chamadas complementares previstas no item 9.4.1 e persistindo a existência de vagas não ocupadas, novo processo seletivo será realizado com regramento a ser publicado em edital próprio.

                    	11.6 Os candidatos que não têm acesso a equipamento e/ou internet poderão dirigir-se a um dos campi do IFPR (de acordo com os endereços indicados no Anexo V), de segunda-feira a sexta-feira, no horário de funcionamento do campus, no período destinado às inscrições.

                    	11.7. Os casos omissos e as situações não previstas no presente edital serão analisados pela Comissão Central do Processo Seletivo e pela Equipe de Assessoramento do Processo Seletivo.

                    	Curitiba, 20 de setembro de 2024.

                    	Assinado:

                    	logotipo
                    	Documento assinado eletronicamente por ADRIANO WILLIAN DA SILVA VIANA PEREIRA, Reitor, em 20/09/2024, às 21:20, conforme horário oficial de Brasília, com fundamento no art. 6º, caput, do Decreto nº 8.539, de 8 de outubro de 2015.

                    	QRCode Assinatura
                    	A autenticidade deste documento pode ser conferida no site https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&id_orgao_acesso_externo=0, informando o código verificador 3185070 e o código CRC 509D8EE8.

                    	ANEXO I - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	As informações sobre os cursos, como campus, nome do curso, nível de ensino, forma de oferta, número de turmas, turno, vagas, e duração, estão organizadas abaixo:
CAMPUS | CURSO | NÍVEL DE ENSINO | FORMA DE OFERTA | TURMAS | TURNO | VAGAS | DURAÇÃO
------- | -------- | -------- | -------- | -------- | -------- | -------- | --------
Assis Chateaubriand | Técnico em Agropecuária | Médio | Integrado | 1 | Diurno (Manhã + 3 tardes por semana) | 40 | 3 anos
Assis Chateaubriand | Técnico em Comércio | Médio | Integrado | 1 | Diurno (Manhã + 1 tarde por semana) | 40 | 3 anos
Assis Chateaubriand | Técnico em Eletromecânica | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Assis Chateaubriand | Técnico em Informática para Internet | Médio | Integrado | 1 | Diurno (manhã + 2 tardes por semana) | 40 | 3 anos
Astorga | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Barracão | Técnico em Administração | Médio | Integrado | 2 | Matutino | 80 | 4 anos
Barracão | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Campo Largo | Técnico em Administração | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Campo Largo | Técnico em Agroecologia | Médio | Integrado | 1 | Vespertino | 40 | 4 anos
Campo Largo | Técnico em Automação Industrial | Médio | Integrado | 1 | Vespertino | 40 | 4 anos
Campo Largo | Técnico em Mecânica | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Capanéma | Técnico em Cooperativismo | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Capanéma | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Capanéma | Técnico em Agroecologia | Médio | Integrado | 1 | Diurno (manhã e tarde) | 40 | 3 anos
Cascavel | Técnico em Edificações | Médio | Integrado | 1 | Diurno (manhã+duas tardes) | 40 | 3 anos
Cascavel | Técnico em Informática | Médio | Integrado | 1 | Diurno (manhã+duas tardes) | 40 | 3 anos
Cascavel | Técnico em Química | Médio | Integrado | 1 | Diurno (manhã+duas tardes) | 40 | 3 anos
Colombo | Técnico em Administração | Médio | Integrado | 1 | Matutino + duas tardes por semana | 40 | 3 anos
Colombo | Técnico em Alimentos | Médio | Integrado | 1 | Vespertino | 40 | 4 anos
Colombo | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Coronel Vivida | Técnico em Administração | Médio | Integrado | 1 | Diurno (Manhã + 2 tardes) | 40 | 3 anos
Coronel Vivida | Técnico em Cooperativismo | Médio | Integrado | 1 | Diurno (Manhã + 2 tardes) | 40 | 3 anos
CR Ponta Grossa | Técnico em Informática | Médio | Integrado | 1 | Integral | 35 | 4 anos
CR Toledo | Técnico em Informática para Internet | Médio | Integrado | 1 | Diurno (manhã + 2 tardes por semana) | 40 | 3 anos
Curitiba | Técnico em Administração | Médio | Integrado | 1 | Matutino | 30 | 3 anos
Curitiba | Técnico em Contabilidade | Médio | Integrado | 1 | Matutino | 30 | 3 anos
Curitiba | Técnico em Eletrônica | Médio | Integrado | 1 | Vespertino | 30 | 3 anos
Curitiba | Técnico em Informática | Médio | Integrado | 1 | Vespertino | 30 | 4 anos
Curitiba | Técnico em Mecânica | Médio | Integrado | 1 | Vespertino | 30 | 3 anos
Curitiba | Técnico em Petróleo e Gás | Médio | Integrado | 1 | Matutino | 30 | 3 anos
Curitiba | Técnico em Processos Fotográficos | Médio | Integrado | 1 | Vespertino | 30 | 3 anos
Curitiba | Técnico em Programação de Jogos Digitais | Médio | Integrado | 1 | Matutino | 30 | 4 anos
Foz do Iguaçu | Técnico em Aquicultura | Médio | Integrado | 1 | Diurno (Manhã + 1 tarde) | 40 | 3 anos
Foz do Iguaçu | Técnico em Desenvolvimento de Sistemas | Médio | Integrado | 1 | Integral | 40 | 4 anos
Foz do Iguaçu | Técnico em Edificações | Médio | Integrado | 1 | Integral | 40 | 4 anos
Foz do Iguaçu | Técnico em Meio Ambiente | Médio | Integrado | 1 | Integral | 40 | 4 anos
Goioerê | Técnico em Informática | Médio | Integrado | 2 | Matutino | 80 | 4 anos
Irati | Técnico em Agroecologia | Médio | Integrado | 1 | Matutino | 40 | 3 anos
Irati | Técnico em Agroecologia | Médio | Integrado | 1 | Vespertino | 40 | 3 anos
Irati | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 3 anos
Irati | Técnico em Informática | Médio | Integrado | 1 | Vespertino | 40 | 3 anos
Ivaíporã | Técnico em Agropecuária | Média | Integrado | 1 | Diurno (Matutino + 1 tarde) | 35 | 3 anos
Ivaíporã | Técnico em Eletrotécnica | Médio | Integrado | 1 | Diurno (Matutino + 1 tarde) | 40 | 3 anos
Ivaíporã | Técnico em Informática | Médio | Integrado | 1 | Diurno (Matutino + 1 tarde) | 40 | 3 anos
Jacarezinho | Técnico em Alimentos | Médio | Integrado | 1 | Diurno | 40 | 3,5 a 4 anos
Jacarezinho | Técnico em Eletrotécnica | Médio | Integrado | 1 | Diurno | 20 | 4 anos
Jacarezinho | Técnico em Informática | Médio | Integrado | 1 | Diurno | 40 | 4 anos
Jacarezinho | Técnico em Mecânica | Médio | Integrado | 1 | Diurno | 20 | 4 anos
Jaguariaíva | Técnico em Alimentos | Médio | Integrado | 1 | Diurno (manhã e tarde) | 40 | 4 anos
Jaguariaíva | Técnico em Biotecnologia | Médio | Integrado | 1 | Diurno (manhã e tarde) | 40 | 4 anos
Londrina | Técnico em Biotecnologia | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Londrina | Técnico em Informática | Médio | Integrado | 1 | Vespertino | 40 | 4 anos
Palmas | Técnico em Alimentos | Médio | Integrado | 1 | Diurno (Vespertino + 2 manhãs por semana) | 40 | 3 anos
Palmas | Técnico em Informática para Internet | Médio | Integrado | 1 | Diurno (Vespertino + 2 manhãs por semana) | 40 | 3 anos
Palmas | Técnico em Serviços Jurídicos | Médio | Integrado | 1 | Diurno (Vespertino + 2 manhãs por semana) | 40 | 3 anos
Paranaguá | Técnico em Informática | Médio | Integrado | 1 | Vespertino | 40 | 4 anos
Paranaguá | Técnico em Mecânica | Médio | Integrado | 1 | Diurno (tarde e manhã) | 40 | 4 anos
Paranaguá | Técnico em Meio Ambiente | Médio | Integrado | 1 | Vespertino | 40 | 4 anos
Paranaguá | Técnico em Produção Cultural | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Paranavaí | Técnico em Agroindústria | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Paranavaí | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Paranavaí | Técnico em Mecatrônica | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Pinháis | Técnico em Administração | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Pinháis | Técnico em Informática | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Pitanga | Técnico em Alimentos | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Pitanga | Técnico em Cooperativismo | Médio | Integrado | 1 | Matutino | 40 | 4 anos
Quedas do Iguaçu | Técnico em Informática | Médio | Integrado | 1 | Diurno (Manhã + 2 tardes por semana) | 38 | 3 anos
Quedas do Iguaçu | Técnico em Meio Ambiente | Médio | Integrado | 1 | Diurno (Manhã + 2 tardes por semana) | 38 | 3 anos
Telêmaco Borba | Técnico em Automação Industrial | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
Telêmaco Borba | Técnico em Informática para Internet | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
Telêmaco Borba | Técnico em Mecânica | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
Telêmaco Borba | Técnico em Programação de Jogos Digitais | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
Umuarama | Técnico em Edificações | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
Umuarama | Técnico em Informática | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
Umuarama | Técnico em Química | Médio | Integrado | 1 | Matutino/Vespertino | 40 | 4 anos
União da Vitória | Técnico em Informática | Médio | Integrado | 1 | Diurno (Manhã + 2 tardes) | 40 | 3 anos
União da Vitória | Técnico em Meio Ambiente | Médio | Integrado | 1 | Diurno (Manhã + 2 tardes) | 40 | 3 anos

                    	¹Os cursos cujos turnos estão assinalados como sendo “Diurno (matutino e vespertino)”, “Diurno (manhã e tarde)”, “Diurno (manhã+duas tardes)”, “Matutino e Vespertino”, “Matutino + duas tardes por semana”, “Diurno”, “Matutino/Vespertino” e “Diurno (Vespertino + 2 manhãs por semana)”, “Diurno (Manhã + 2 tardes por semana)” aparecerão no Portal do Candidato do IFPR como turno “Integral”, sem prejuízo à informação deste quadro de vagas e a consequente necessidade de o estudante cumpri-la.

                    	² Os cursos cujos turnos estão assinalados como sendo “Manhã + 1 tarde por semana”,” Diurno (Manhã + 1 tarde)”, “Diurno (Matutino + 1 tarde)” aparecerão no Portal do Candidato do IFPR como turno “Matutino”, sem prejuízo à informação deste quadro de vagas e a consequente necessidade de o estudante cumpri-la.

                    	ANEXO II - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	DISTRIBUIÇÃO DAS VAGAS POR FAIXAS DE AÇÃO AFIRMATIVA

                    	Estudantes que tenham cursado a etapa anterior integralmente em Escola Pública (60% das vagas)

                    	Ações afirmativas - IFPR (15% das vagas)

                    	Ampla Concorrência (25% das vagas)

                    	Estudantes que possuam renda bruta familiar per capita igual ou inferior a 1 salário mínimo (30% das vagas)

                    	Estudantes que possuam renda bruta familiar per capita superior a 1 salário mínimo (30% das vagas)

                    	Campi:

BR-EP-PPI

BR-EP-Q

BR-EP-PCD

BR-EP1

EP-PPI

EP-Q

EP-PCD

EP

IFPR-PPI

IFPR-PCD

AC

Cursos:

80

20

10

38

35

30

20

10

5

Turnos:

9

40

3

4

4

4

3

1

1

Detalhes das Vagas por Campus, Curso e Turno:

BR-EP-PPI:

Curso 80: 11 vagas

Curso 20: 5 vagas

Curso 10: 5 vagas

Curso 38: 5 vagas

Curso 35: 5 vagas

Curso 30: 4 vagas

Curso 20: 2 vagas

Curso 10: 2 vagas

Curso 5: 1 vaga

BR-EP-Q:

Curso 80: 9 vagas

Curso 20: 5 vagas

Curso 10: 4 vagas

Curso 38: 4 vagas

Curso 35: 4 vagas

Curso 30: 4 vagas

Curso 20: 3 vagas

Curso 10: 1 vaga

Curso 5: 1 vaga

BR-EP-PCD:

Curso 80: 1 vaga

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 38: 1 vaga

Curso 35: 1 vaga

Curso 30: 1 vaga

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 5: 1 vaga

BR-EP1:

Curso 80: 3 vagas

Curso 20: 2 vagas

Curso 10: 2 vagas

Curso 38: 2 vagas

Curso 35: 1 vagas

Curso 30: 1 vagas

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 5: 1 vaga

EP-PPI:

Curso 80: 12 vagas

Curso 20: 5 vagas

Curso 10: 5 vagas

Curso 38: 5 vagas

Curso 35: 5 vagas

Curso 30: 4 vagas

Curso 20: 2 vagas

Curso 10: 1 vaga

Curso 5: 1 vaga

EP-Q:

Curso 80: 9 vagas

Curso 20: 5 vagas

Curso 10: 3 vagas

Curso 38: 3 vagas

Curso 35: 3 vagas

Curso 30: 3 vagas

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 5: 1 vaga

EP-PCD:

Curso 80: 0 vagas

Curso 20: 0 vagas

Curso 10: 0 vagas

Curso 38: 0 vagas

Curso 35: 0 vagas

Curso 30: 0 vagas

Curso 20: 0 vagas

Curso 10: 0 vagas

Curso 5: 0 vagas

EP:

Curso 80: 3 vagas

Curso 20: 2 vagas

Curso 10: 2 vagas

Curso 38: 2 vagas

Curso 35: 1 vagas

Curso 30: 1 vagas

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 5: 1 vaga

IFPR-PPI:

Curso 80: 12 vagas

Curso 20: 5 vagas

Curso 10: 5 vagas

Curso 38: 5 vagas

Curso 35: 5 vagas

Curso 30: 4 vagas

Curso 20: 2 vagas

Curso 10: 1 vaga

Curso 5: 1 vaga

IFPR-PCD:

Curso 80: 8 vagas

Curso 20: 3 vagas

Curso 10: 3 vagas

Curso 38: 3 vagas

Curso 35: 3 vagas

Curso 30: 3 vagas

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 5: 1 vaga

AC:

Curso 80: 4 vagas

Curso 20: 2 vagas

Curso 10: 2 vagas

Curso 38: 2 vagas

Curso 35: 2 vagas

Curso 30: 1 vagas

Curso 20: 1 vaga

Curso 10: 1 vaga

Curso 5: 1 vaga

                    	OBSERVAÇÃO: O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, seguem o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas cotas não atendam os percentuais indicados no título.

                    	ANEXO III - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	MAPA DE MIGRAÇÃO DAS VAGAS EM AÇÕES AFIRMATIVAS SEM CANDIDATOS APTOS A OCUPÁ-LAS

                    	SOBROU VAGA AQUI

                    	1º VAI PARA:

                    	2º VAI PARA:

                    	3º VAI PARA:

                    	4º VAI PARA:

                    	5º VAI PARA:

                    	6º VAI PARA:

                    	7º VAI PARA:

                    	8º VAI PARA:

                    	9º VAI PARA:

                    	10º VAI PARA:

                    	IFPR-PPI

                    	IFPR-PCD

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	IFPR-PCD

                    	IFPR-PPI

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	BR-EP-Q

                    	BR-EP-PPI

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	BR-EP-PCD

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	BR-EP

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	EP-PPI

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-Q

                    	EP-PCD

                    	EP

                    	AC

                    	EP-Q

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-PCD

                    	EP

                    	AC

                    	EP-PCD

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP

                    	AC

                    	EP

                    	BR-EP-PPI

                    	BR-EP-Q

                    	BR-EP-PCD

                    	BR-EP

                    	EP-PPI

                    	EP-Q

                    	EP-PCD

                    	AC

                    	ANEXO IV EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	ORIENTAÇÕES PARA INSCRIÇÃO E CÁLCULO DA MÉDIA DOS COMPONENTES CURRICULARES DE MATEMÁTICA E LÍNGUA PORTUGUESA DE CONCLUSÃO DO ENSINO FUNDAMENTAL

                    	A média final deverá ser expressa de 0,00 (zero) a 10,00 (dez), utilizando-se duas casas após a vírgula.

                    	a) Deve-se indicar as notas de Língua Portuguesa e Matemática do sétimo ano.

                    	b) Deve-se indicar as notas de Língua Portuguesa e Matemática do oitavo ano.

                    	c) O sistema fará a média das notas.

                    	d) Ao indicar suas médias, o(a) candidato(a) deverá considerar as seguintes situações:

                    	e) Caso o histórico contenha notas em escalas diferentes de 0(zero) a 10(dez), as notas devem ser convertidas antes de realizar o cálculo da média geral. Por exemplo, no caso da nota estar representada no formato 88, esta deve ser transformada para 8,8(88 ÷ 10).

                    	f) Caso o histórico venha com conceitos e não notas, respeitar a tabela indicada no item 6.4.3 deste edital.

                    	g) Estudantes que possuem em seu histórico escolar registro de disciplinas (Português e/ou Matemática) com dependência, deverão considerar a nota obtida após aprovação na referida disciplina de dependência. Por exemplo, o estudante ficou em dependência na disciplina A em seu 7º ano do ensino médio, vindo a cursar a dependência desta disciplina no 8º ano. Ao calcular a média do sétimo ano, deverá ser considerada, para a disciplina A, a nota obtida na dependência cursada durante o oitavo ano.

                    	Para a modalidade Ensino Fundamental via Certificação do Encceja (Exame Nacional para Certificação de Competências de Jovens e Adultos):

                    	a) O(A) candidato(a) deverá informar a pontuação obtida nas áreas de conhecimento Linguagens, Códigos e suas Tecnologias e Matemática e suas Tecnologias.

                    	b) O sistema fará a média.

                    	ANEXO V - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	ENDEREÇOS DOS CAMPI DO IFPR

                    	CAMPUS | ENDEREÇO | PÁGINA ELETRÔNICA
------- | -------- | --------
Arapongas | Rua Surucuá Açu, 321 – Vila Araponguinha | https://ifpr.edu.br/arapongas/
Astorga | Rodovia PR 454, Contorno Norte | https://ifpr.edu.br/astorga/
Assis Chateaubriand | Av. Cívica, 475 – Centro Cívico | https://ifpr.edu.br/assis-chateaubriand/
Barracão | Rodovia BR 163, nº 2115 - Industrial, Barracão | https://ifpr.edu.br/barracao/
Campo Largo | R. Eng. Tourinho, 829 - Vila Solene | https://ifpr.edu.br/campo-largo/
Capanema | Rua Cariris nº 750 Bairro Santa Bárbara | https://ifpr.edu.br/capanema/
Cascavel | Avenida das Pombas, 2020 - Floresta | https://ifpr.edu.br/cascavel/
Colombo | Rua Antonio Chemin, 28, São Gabriel | https://ifpr.edu.br/colombo/
Coronel Vivida | PR 562, Flor da Serra | https://ifpr.edu.br/coronel-vivida/
Curitiba | R. João Negrão, 1285 | https://ifpr.edu.br/curitiba/
Foz do Iguaçu | Avenida Araucária, 780, Bairro Vila A | https://ifpr.edu.br/foz-do-iguacu/
Goioerê | Rodovia Luiz Dechiche, s/nº | https://ifpr.edu.br/goioere/
Irati | Rua Pedro Koppe, 100 – Vila Matilde | https://ifpr.edu.br/irati/
Ivaíporã | Rua Max Arthur Greipel, nº 505 | https://ifpr.edu.br/ivaipora/
Jacarezinho | Avenida Dr. Tito nº: 801 – Jardim Panorama | https://ifpr.edu.br/jacarezinho/
Jaguariaíva | Av. Eloa Martins Passos Felix – Rod. 151 Km 213,7 | https://ifpr.edu.br/jaguariaiva/
Londrina | Rua João XXIII, nº 600, Jardim Dom Bosco | https://ifpr.edu.br/londrina/
Palmas | Av. Bento Munhoz da Rocha Neto, s/nº | https://ifpr.edu.br/palmas/
Paranaguá | Rua Antonio Carlos Rodrigues, n.º 453 – Porto Seguro | https://ifpr.edu.br/paranagua/
Paranavaí | Rua José Felipe Tequinha, 1400 – Jardim das Nações | https://ifpr.edu.br/paranavai/
Pinháis | Rua Humberto de Alencar Castelo Branco, 1575 Jardim Amélia | https://ifpr.edu.br/pinhais/
Pitanga | Rua José de Alencar, 1.080 – Vila Planalto | https://ifpr.edu.br/pitanga/
Quedas do Iguaçu | Rua, Marginal Imbirama, 300 - linha Tapuí | https://ifpr.edu.br/quedas-do-iguacu/
Telêmaco Borba | Rodovia PR 160 – km 19,5 – Jardim Bandeirantes | https://ifpr.edu.br/telemaco-borba/
Umuarama | Rodovia PR 323, KM 302, Parque Industrial | https://ifpr.edu.br/umuarama/
União da Vitória | Av. Paula Freitas, 2800 - São Braz | https://ifpr.edu.br/uniao-da-vitoria/


                    	ANEXO VI - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	FORMULÁRIO PARA ISENÇÃO DA TAXA DE INSCRIÇÃO DE PROCESSO SELETIVO

                    	IDENTIFICAÇÃO DO CANDIDATO

                    	Nome completo:

                    	Número de Identificação Social do candidato(NIS):

                    	Nº da Carteira de Identidade:

                    	CPF:

                    	Email:

                    	Telefone:

                    	Curso e Campus para qual está inscrito(a):

                    	O(A) candidato(a) declara estar inscrito(a) no Cadastro único para programas Sociais do Governo Federal e possuir perfil de de renda bruta familiar de até meio(0,5) salário mínimo per capita.

                    	( )SIM ( )NÃO

                    	Documentos a serem enviados junto a este formulário:

                    	a) Digitalização da carteira de identificação(CI) do(a) candidato(a);

                    	b) Comprovante de inscrição no Cadastro Único para Programas Sociais do Governo Federal – Cadastro Único.

                    	____________________________(PR), ____de _____________________de 20.

                    	Assinatura do(a) declarante ou responsável legal (quando o(a) declarante tiver idade inferior a 18 anos)

                    	**Ratifico serem verdadeiras as informações prestadas, estando ciente de que a informação falsa incorrerá nas penas do crime do art. 299 do Código Penal (falsidade ideológica);

                    	ANEXO VII - EDITAL Nº 87, DE 20 DE setembro DE 2024

                    	COMPROVAÇÃO DOCUMENTAL DA RENDA BRUTA MENSAL PARA AVALIAÇÃO DE COTAS BAIXA RENDA

                    	Os/as candidatos/as aprovados/as nas ações afirmativas de escola pública e baixa renda (BR-EP; BR-EP-PCD; BR-EP-Q; BR-EP-PPI) deverão comprovar renda familiar bruta mensal per capita (por pessoa) igual ou inferior a 1 (um) salário-mínimo nacional - (R$ 1.412,00).

                    	Para essa comprovação, você poderá proceder de 2 formas distintas:

                    	a) Apresentar comprovante de inscrição do CadÚnico (Programa de Cadastro único do Governo Federal) que deverá estar atualizado nos últimos 24 (vinte e quatro) meses anteriores à data de inscrição no Processo Seletivo.

                    	OU como alternativa aos que não possuem inscrição no CadÚnico:

                    	b) Enviar os comprovantes exigidos em edital para todos os membros da família:

                    	1: Preencher e assinar a Declaração de Núcleo Familiar Renda Bruta Familiar disponível no link indicado no item 1.1.2 deste edital.

                    	2: ANEXAR DOCUMENTAÇÃO COMUM A TODOS OS MEMBROS DO NÚCLEO FAMILIAR E AO CANDIDATO:

                    	a) Certidão de Nascimento ou Cédula de Identidade (RG) ou Passaporte ou Carteira Nacional de Habilitação, de todos os integrantes do núcleo familiar;

                    	b) CPF de todos os integrantes do núcleo familiar, com mais de 18 anos;

                    	c) Comprovante de residência;

                    	d) Carteira de Trabalho e Previdência Social (CTPS) física, para todos os integrantes com mais de 18 anos, a qual deverá conter as páginas da: foto, qualificação civil, contratos de trabalho e a próxima página em branco de contrato de trabalho. Ou, Carteira de Trabalho Digital em PDF Único atualizada, contendo todos os dados pessoais e contratos de trabalho. Caso não possua CTPS, preencher e assinar Declaração De Não Possuir Carteira De Trabalho E Previdência Social (CTPS) disponível no link indicado no item 1.1.2 deste edital.

                    	e) Declaração de Imposto de Renda completa COM recibo (Exercício 2024, ano calendário 2023), aos componentes do núcleo familiar com mais de 18 anos, caso seja declarante. Aos componentes do núcleo familiar, com mais de 18 anos não declarantes de Imposto de Renda, apresentar comprovante, disponível no link abaixo para consulta: Disponível em: https://www.restituicao.receita.fazenda.gov.br

                    	3: DOCUMENTAÇÃO DE RENDA PARA TODOS OS INTEGRANTES DO NÚCLEO FAMILIAR COM MAIS DE 18 ANOS: (Caso o núcleo familiar seja composto por integrantes de diferentes categorias (assalariados, autônomos etc.), a documentação deverá ser apresentada em acordo com cada realidade de trabalho e renda).

                    	3.1. DESEMPREGADOS, ESTUDANTES OU DONA(O) DE CASA:

                    	a) Em caso de desemprego recente, apresentar Rescisão de Contrato e comprovante de recebimento do seguro desemprego, e/ou;

                    	b) Preencher e assinar a Declaração – Não Possui Renda Mensal disponível no link indicado no item 1.1.2 deste edital.

                    	3.2. TRABALHADORES ASSALARIADOS (celetistas, servidores públicos, empregado doméstico, aprendizes):

                    	a) Contracheques/holerites dos três meses anteriores à inscrição (julho, agosto e setembro de 2024).

                    	3.3. APOSENTADOS, PENSIONISTAS E DEMAIS BENEFICIÁRIOS DO INSS:

                    	a) Comprovante do benefício do INSS (aposentado, pensionista ou demais beneficiários), demonstrando o valor bruto recebido dos três últimos meses anteriores à inscrição (julho, agosto e setembro de 2024); OU

                    	b) Comprovante de aposentadoria (caso não seja INSS).

                    	3.4. AUTÔNOMOS E PROFISSIONAIS LIBERAIS:

                    	a) Extratos bancários dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e;

                    	b) Preencher e assinar declaração da atividade desenvolvida como autônomo ou liberal e a renda bruta mensal (Declaração Renda variável) disponível no link indicado no item 1.1.2 deste edital.

                    	c) Guias de recolhimento ao INSS com comprovante de pagamento dos três meses anteriores à inscrição.

                    	3.5. EMPRESÁRIO OU PESSOAS COM PARTICIPAÇÃO EM COTAS DE EMPRESAS OU MICROEMPRESAS:

                    	a) Extratos bancários dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e;

                    	b) Preencher e assinar declaração da atividade desenvolvida e a renda como empresário/microempreendedor (Declaração Renda variável) disponível no link indicado no item 1.1.2 deste edital.

                    	c) Pró-labores dos três últimos meses anteriores à inscrição (julho, agosto e setembro de 2024), e;

                    	d) Declaração completa de Imposto de Renda de Pessoa Jurídica – DIPJ, exercício 2024 ano calendário 2023, acompanhado do recibo de entrega, quando houver;

                    	e) Declaração completa de Informações socioeconômicas e Fiscais (DEFIS- Simples Nacional) para Microempresários e Empresários de Pequeno Porte, quando houver;

                    	f) Declaração Comprobatória de Percepção de Rendimentos (DECORE), quando houver,

                    	3.6. MICROEMPREENDEDOR INDIVIDUAL:

                    	a) Extratos bancários dos dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e

                    	b) Preencher e assinar declaração relatando a atividade desenvolvida como microempreendedor e a renda mensal (Declaração Renda variável), disponível no link indicado no item 1.1.2 deste edital; e

                    	c) Declaração Anual CNPJ MEI (DASN-SIMEI).

                    	3.7. TRABALHADORES DO MERCADO INFORMAL: (atividade sem vínculo empregatício, não possui contrato de trabalho, não contribui com INSS).

                    	a) Preencher e assinar declaração relatando a renda bruta mensal e a atividade desenvolvida como trabalhador informal (Declaração Renda variável), disponível no link indicado no item 1.1.2 deste edital.

                    	3.8. ESTAGIÁRIOS ou BOLSISTAS:

                    	a) Contrato de estágio/bolsa, ou Termo de Compromisso de estágio/bolsa.

                    	3.9. RENDIMENTOS DE ALUGUEL OU ARRENDAMENTO DE BENS MÓVEIS E IMÓVEIS:

                    	a) Extratos bancários dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e

                    	b) Contrato(s) de locação ou arrendamento(s) devidamente registrado(s) em cartório, acompanhado(s) dos recibos dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), ou;

                    	c) Preencher e assinar declaração de próprio punho relatando o valor recebido, acompanhada dos recibos dos três últimos meses anteriores à inscrição (julho, agosto e setembro de 2024).

                    	3.10. PARA CASOS DE RECEBIMENTO DE PENSÃO ALIMENTÍCIA:

                    	a) Decisão judicial discriminando o nome do(s) beneficiários e o valor a ser pago, ou;

                    	b) Preencher e assinar declaração do beneficiário e o valor mensal recebido de pensão, (Declaração Renda variável), disponível no link indicado no item 1.1.2 deste edital.

                    	3.11. ATIVIDADE RURAL:

                    	a) Extratos bancários dos dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e

                    	b) Declaração do sindicato rural, associação, cooperativa ou prefeitura, contendo o valor recebido mensalmente ou anualmente e informações detalhadas atividade desenvolvida, ou

                    	c) Preencher e assinar declaração, contendo o valor recebido mensalmente ou anualmente, e informações da atividade desenvolvida, anexando as 3 (três últimas) notas fiscais de vendas de produtos, (Declaração Renda variável), disponível no link indicado no item 1.1.2 deste edital; e

                    	d) Declaração de Imposto de Renda Pessoa Jurídica - IRPJ, quando houver;

                    	e) Quaisquer declarações tributárias referentes a pessoas jurídicas vinculadas ao candidato ou a membros da família, quando for o caso.

                    	ANEXO VIII - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	FORMULÁRIO DE SOLICITAÇÃO DE RECURSO

                    	Nome do candidato(a):

                    	Curso e campus para o qual se inscreveu:

                    	CPF do candidato(a):

                    	Selecione o tipo de recurso que você deseja protocolar (assinale apenas uma opção)

                    	( ) Recurso contra homologação de inscrição.

                    	( ) Recurso contra o indeferimento da solicitação de isenção da taxa de inscrição.

                    	( ) Recurso contra o indeferimento da autodeclaração étnico-racial.

                    	( ) Recurso contra o indeferimento da matrícula.

                    	Justificativa do recurso:

                    	_____________________-PR, ____ de ____________________ de 20.

                    	Assinatura do(a) Candidato(a) ou do Responsável Legal

                    	Justificativa da decisão:

                    	ANEXO IX - EDITAL Nº 87, DE 20 DE SETEMBRO DE 2024

                    	REQUERIMENTO DE MATRÍCULA

                    	CURSO:________________________________________________________________

                    	( ) Integrado ( ) Subsequente ( ) Licenciatura ( ) Bacharelado ( ) Tecnologia

                    	CAMPUS:_______________________________________________________________

                    	PERÍODO DE INGRESSO: 2025

                    	SEMESTRE:TURNO:_____________________

                    	AÇÃO AFIRMATIVA DE CONCORRÊNCIA/COTA: _______________ (Ver Código Quadro Abaixo)

                    	IFPR-PPI - candidatos autodeclarados pretos, pardos ou indígenas, independentemente de renda familiar e de ter cursado a etapa anterior em escola pública.

                    	IFPR-PCD - candidatos com deficiência, independentemente de renda familiar e de ter cursado a etapa anterior integralmente em escola pública.

                    	EP - estudantes que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	BR-EP - candidatos que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	BR-EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	BR-EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	AC - Ampla Concorrência.

                    	DADOS DO ESTUDANTE:

                    	NOME:_________________________________________________________________

                    	RG______________________ ORG./UF:________ CPF__________________________

                    	NOME DO RESPONSÁVEL LEGAL: _________________________________________________________________

                    	PARENTESCO DO RESPONSÁVEL LEGAL COM O ESTUDANTE: ___________________________________________

                    	(Nos casos de guarda, tutela ou outro documento de responsabilidade incluir junto ao requerimento o documento comprobatório).

                    	TELEFONE DO ESTUDANTE:________________________ TELEFONE DO RESPONSÁVEL:_______________________

                    	EMAIL:_________________________________________________________________

                    	ENDEREÇO RESIDENCIAL: ________________________________________________________________ CEP: _________________________

                    	( ) DECLARO, sob as penas da lei, que não possuo escolaridade de nível superior (Para os candidatos que concorrem às vagas de inclusão).

                    	( ) DECLARO, para os devidos fins, que assumo total responsabilidade sobre as informações contidas neste documento. Por ser expressão da verdade, dato e assino o presente documento, ficando ciente de que no caso de inveracidade comprovada estarei sujeito às penalidades cabíveis.

                    	_____________________, __________ de _______________________ de 20

                    	Assinatura da(o) estudante                             	Assinatura da(o) responsável legal
                    	content_copy
                    	Use code with caution.

                    	ANEXO X - EDITAL IFPR Nº 87 DE 20 de setembro de 2024

                    	DECLARAÇÃO DA COMUNIDADE ÍNDIGENA

                    	Declaramos para os devidos fins que o(a) candidato(a) __________________________________________ portador(a) do CPF n.º _______________________________, reside/pertence à Comunidade Indígena de ___________________________________ do município de ______________________________ , Estado ________________________.

                    	DADOS DA LIDERANÇA 1

                    	Nome completo:

                    	CPF:

                    	Telefone (com código de área): (____) _____________________

                    	Função que exerce na Comunidade Indígena:

                    	Assinatura

                    	DADOS DA LIDERANÇA 2

                    	Nome completo:

                    	CPF:

                    	Telefone (com código de área): (____) _____________________

                    	Função que exerce na Comunidade Indígena:

                    	Assinatura

                    	DADOS DA LIDERANÇA 3

                    	Nome completo:

                    	CPF:

                    	Telefone (com código de área): (____) _____________________

                    	Função que exerce na Comunidade Indígena:

                    	Assinatura

                    	ANEXO XI - EDITAL IFPR Nº 87 DE 20 de setembro de 2024

                    	DECLARAÇÃO DA COMUNIDADE QUILOMBOLA

                    	Declaramos para os devidos fins que o(a) candidato(a) __________________________________________ portador(a) do CPF n.º _______________________________, reside/pertence à Comunidade Quilombola de ___________________________________ do município de ______________________________ , Estado ________________________.

                    	DADOS DA LIDERANÇA 1

                    	Nome completo:

                    	CPF:

                    	Telefone (com código de área): (____) _____________________

                    	Função que exerce na Comunidade Quilombola:

                    	Assinatura

                    	DADOS DA LIDERANÇA 2

                    	Nome completo:

                    	CPF:

                    	Telefone (com código de área): (____) _____________________

                    	Função que exerce na Comunidade Quilombola:

                    	Assinatura

                    	DADOS DA LIDERANÇA 3

                    	Nome completo:

                    	CPF:

                    	Telefone (com código de área): (____) _____________________

                    	Função que exerce na Comunidade Quilombola:

                    	Assinatura

                    	Referência: Processo nº 23411.007465/2024-31 SEI nº 3185070
                    	INSTITUTO FEDERAL DO PARANÁ | GR/DEAC/IFPR-DEAC/GR
                    	Rua Emilio Bertolini, nº 54, Curitiba - PR | CEP CEP 82920-030 - Brasil
`;
            var edital88 = `Edital N°88, de 20 de setembro de 2024

                    	PROCESSO SELETIVO IFPR 2025 - CURSOS TÉCNICOS SUBSEQUENTES AO ENSINO MÉDIO

                   	 

                    	O Reitor do Instituto Federal de Educação, Ciência e Tecnologia do Paraná, no uso da competência que lhe confere o Decreto de 06 de fevereiro de 2024, publicado no Diário Oficial da União no dia 07 de fevereiro de 2024, seção 2, página 01, torna público as normas que regem o Processo Seletivo IFPR 2025 para ingresso nos Cursos Técnicos Subsequentes ao Ensino Médio, na modalidade presencial, ofertados para o ano de 2025, considerando a política de inclusão do IFPR para o ingresso de estudantes nos cursos. As inscrições estarão abertas de 03 de outubro a 01 de novembro de 2024.

                   	 

                    	BASE LEGAL

                    	Lei nº 9.394, de 20 de dezembro de 1996 - Estabelece as diretrizes e bases da educação nacional.

                    	Decreto nº 3.298, de 20 de dezembro de 1999 - Regulamenta a Lei no 7.853, de 24 de outubro de 1989, dispõe sobre a Política Nacional para a Integração da Pessoa Portadora de Deficiência, consolida as normas de proteção, e dá outras providências.

                    	Decreto nº 5.296, de 02 de dezembro de 2004 - Regulamenta as Leis nos 10.048, de 8 de novembro de 2000, que dá prioridade de atendimento às pessoas que especifica, e 10.098, de 19 de dezembro de 2000, que estabelece normas gerais e critérios básicos para a promoção da acessibilidade das pessoas portadoras de deficiência ou com mobilidade reduzida, e dá outras providências.

                    	Decreto nº 6.593/2008 - Regulamenta o art. 11 da Lei no 8.112, de 11 de dezembro de 1990, quanto à isenção de pagamento de taxa de inscrição em concursos públicos realizados no âmbito do Poder Executivo federal.

                    	Lei nº 12.711, de 29 de agosto de 2012 - Dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio e dá outras providências.

                    	Lei nº 12.764, de 27 de dezembro de 2012 - Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista; e altera o § 3º do art. 98 da Lei nº 8.112, de 11 de dezembro de 1990.

                    	Decreto nº 7.824, de 11 de outubro de 2012 - Regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

                    	Lei nº 13.146, de 06 de julho de 2015 - Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).

                    	Lei nº 13.409, de 28 de dezembro de 2016 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre a reserva de vagas para pessoas com deficiência nos cursos técnico de nível médio e superior das instituições federais de ensino.

                    	Decreto nº 9.034, de 20 de abril de 2017 - Altera o Decreto n º 7.824, de 11 de outubro de 2012, que regulamenta a Lei n º 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

                    	Lei nº 14.126 de 22 de março de 2021 - Classifica a visão monocular como deficiência sensorial, do tipo visual.

                    	Decreto nº 11.016/2022 - Regulamenta o Cadastro Único para Programas Sociais do Governo Federal, instituído pelo art. 6º-F da Lei nº 8.742, de 7 de dezembro de 1993.

                    	Lei nº 14.723 de 13 de novembro de 2023 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre o programa especial para o acesso às instituições federais de educação superior e de ensino técnico de nível médio de estudantes pretos, pardos, indígenas e quilombolas e de pessoas com deficiência, bem como daqueles que tenham cursado integralmente o ensino médio ou fundamental em escola pública.

                    	Decreto nº 11.781 de 14 de novembro de 2023 - Altera o Decreto nº 7.824, de 11 de outubro de 2012, que regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

                    	Decreto Nº 11.864, de 27 de dezembro de 2023 - Dispõe sobre o valor do salário mínimo a vigorar a partir de 1º de janeiro de 2024.

                    	Portaria Normativa MEC nº 18, de 11 de outubro de 2012 - Dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei no 12.711, de 29 de agosto de 2012, e o Decreto no 7.824, de 11 de outubro de 2012.

                    	Portaria Normativa nº 2.027 de 16 de novembro de 2023 - Altera a Portaria Normativa MEC nº 18, de 11 de outubro de 2012, que dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei nº 12.711, de 29 de agosto de 2012, e a Portaria Normativa MEC nº 21, de 5 de novembro de 2012, que dispõe sobre o Sistema de Seleção Unificada - Sisu.

                    	Resolução Consup/IFPR nº 190/2024 – Dispõe sobre a Organização Didático-Pedagógica dos Cursos Técnicos de Nível Médio na modalidade presencial do Instituto Federal de Educação, Ciência e Tecnologia do Paraná.

                    	Resolução Consup IFPR nº 55/2011 – Dispõe sobre a Organização Didático Pedagógica da Educação Superior no âmbito do Instituto Federal do Paraná – IFPR.

                   	 

                    	1. DAS DISPOSIÇÕES PRELIMINARES

                    	1.1. Os Cursos Técnicos Subsequentes ao Ensino Médio, objeto deste certame, são públicos, gratuitos e presenciais, devendo o(a) candidato(a) ter disponibilidade de tempo para realizar atividades no contraturno e/ou aos sábados, conforme o calendário acadêmico do campus e o projeto pedagógico do curso.

                    	1.1.1 Para acessar tutoriais em vídeo sobre o processo seletivo (com acessibilidade), utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/tutoriais/.

                    	1.1.2 Para acessar formulários e outros documentos editáveis, utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/documentos/.

                    	1.1.3 Para acessar o Portal do Candidato do IFPR, utilize o endereço eletrônico https://portaldocandidato.ifpr.edu.br/.

                    	1.2. Ao término do curso, o estudante fará jus ao diploma de uma habilitação profissional técnica.

                    	1.3. Para ingresso nos Cursos Técnicos Subsequentes ao Ensino Médio o candidato deverá ter concluído, imprescindivelmente, o Ensino Médio.

                    	1.4. O processo seletivo será realizado em uma única etapa, que consistirá na classificação do(a) candidato(a) pelo seu desempenho (notas/conceitos) nas disciplinas de Língua Portuguesa e Matemática do 1º (primeiro) e do 2º (segundo) ano do Ensino Médio, conforme indicado no item 6, deste Edital.

                    	1.4.1. Para os candidatos aos Cursos Técnicos Subsequentes que tenham cursado o Ensino Médio em outro país será considerada a nota/conceito obtido na língua materna do país de origem, em substituição a Língua Portuguesa.

                    	1.5 É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação de todos os atos, editais e comunicados referentes ao Processo Seletivo regido por este edital.

                    	1.6 O(A) candidato(a) que se inscrever pelo Sistema de Ações Afirmativas (cotas) automaticamente autoriza a divulgação dos resultados do Processo Seletivo referente a este edital de acordo com a classificação gerada pelo Sistema de Ações Afirmativas (cotas), nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023.

                    	1.7 O(A) candidato(a) deverá possuir Carteira de Identidade(CI) e CPF para participar do referido processo seletivo.

                    	1.8 Serão considerados documentos de identificação: Carteira de Identidade expedida pelas Secretarias de Segurança Pública, pelas Forças Armadas Brasileiras, por países que possuem acordos diplomáticos com o Brasil, Polícias Militares, Ordens ou Conselhos que, por Lei Federal, tenha validade como documento de identidade e possibilite a conferência da foto e da assinatura; Carteira de Identidade Nacional - CIN; Carteira de Trabalho e Previdência Social(CTPS); Passaporte; ou Carteira Nacional de Habilitação com fotografia – na forma da Lei nº 9.503/97 e o Documento de Identidade Nacional de Estrangeiro (Carteira de Registro Nacional Migratório - CRNM).

                    	1.8.1. A CTPS Digital apenas tem validade como documento para fins de acompanhamento do contrato de trabalho, não sendo válida como documento de identificação.

                    	1.9 Ao se inscrever para este Processo Seletivo, o(a) candidato(a) declara conhecer e aceitar todas as condições descritas neste edital. Declara, ainda, estar ciente de que qualquer omissão ou falsidade, bem como o não atendimento das exigências impostas, culminará com a sua desclassificação do processo.

                   	 

                    	2. DA FORMA DE OFERTA

                    	2.1 Os Cursos Técnicos Subsequentes ao Ensino Médio ofertados neste Edital, na modalidade presencial, são oferecidos a quem já tenha concluído o Ensino Médio. Os cursos são organizados de modo que o estudante conclua o curso com uma habilitação profissional técnica de nível médio.

                    	2.1.1 O calendário letivo, com datas de início e término do ano letivo,  será divulgado no site de cada campus do IFPR, considerando suas especificidades.

                   	 

                    	3. DOS CURSOS E VAGAS

                    	3.1 A distribuição das vagas nos diversos cursos e campi do IFPR e nas diferentes ações afirmativas (cotas de inclusão) e ampla concorrência encontram-se, respectivamente, no Anexo I e no Anexo II deste Edital.

                    	3.2 O total das vagas ofertadas para cada curso e turma será disponibilizado da seguinte forma:

                    	3.2.1 60% (sessenta por cento) do total das vagas ofertadas para cada curso e turma, para cursos com forma de oferta integrada, são reservadas aos candidatos que tenham cursado integralmente o Ensino Fundamental em escolas públicas do Brasil, em cursos regulares ou no âmbito da modalidade de Educação de Jovens e Adultos (EJA), ou tenham obtido certificado de conclusão com base no resultado do exame nacional para certificação de competências de jovens e adultos(Encceja) ou de exames de certificação de competência ou de avaliação de jovens e adultos realizados pelos sistemas estaduais de ensino. Esse percentual será distribuído da seguinte maneira:

                    	3.2.1.1 50% (cinquenta por cento) serão destinados aos candidatos que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário - mínimo nacional per capita (R$ 1.412,00), havendo reserva de vagas para candidatos:

                    	3.2.1.1.1 BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas.

                    	3.2.1.1.2  BR-EP-Q - Autodeclarados quilombolas.

                    	3.2.1.1.3 BR-EP-PCD - Pessoas com deficiência.

                    	3.2.1.1.4 BR-EP - Demais candidatos.

                    	3.2.1.2 50% (cinquenta por cento) serão destinados aos candidatos que, independentemente de renda familiar, havendo reserva de vagas para candidatos:

                    	3.2.1.2.1 EP-PPI -  Autodeclarados pretos, pardos ou indígenas.

                    	3.2.1.2.2 EP-Q - Autodeclarados quilombolas.

                    	3.2.1.2.3 EP-PCD - Pessoas com deficiência.

                    	3.2.1.2.4 EP - Demais candidatos

                    	3.3.1 IFPR-PPI - 10% (dez por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos autodeclarados pretos, pardos ou indígenas.

                    	3.3.2 IFPR-PCD - 5% (cinco por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos com deficiência.

                    	3.3.3 25% (vinte por cento) do total das vagas ofertadas para cada curso e turma são reservadas à Ampla Concorrência (AC). Nesta forma de oferta estão incluídos estudantes que estudaram qualquer tempo em escolas particulares, mesmo sendo bolsistas.

                    	3.4 Os Processos Seletivos do IFPR realizam reserva de vagas através do Sistema de Ações Afirmativas (cotas), estabelecidas nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023 mediante a comprovação das respectivas condições por meio de documentos.

                    	3.4.1 O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, segue o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas ações afirmativas (cotas), bem como a ampla concorrência não atendam exatamente os percentuais indicados.

                    	3.4.2 A base para a distribuição de vagas em cada ação afirmativa (cota) e na Ampla Concorrência encontra-se no Anexo II deste edital.

                    	3.4.3. Candidatos(as) estrangeiros, que não sejam naturalizados, ou que tenham feito parte de seu estudo no exterior, não poderão participar do processo seletivo na reserva de vagas para estudantes de escola pública, devendo, portanto, responder NÃO à pergunta de número 1 (um) do Questionário Socioeconômico no momento da inscrição.

                    	3.5. As ações afirmativas às quais o(a) candidato(a) poderá concorrer durante o processo seletivo serão definidas mediante preenchimento de questionário socioeconômico, durante a realização da inscrição.

                    	3.5.1. O questionário socioeconômico a que se refere o item 3.5 possuirá as seguintes questões:

                    	a) QUESTÃO 01 - Você concluiu TODA a etapa de ensino anterior à modalidade de curso para a qual está se inscrevendo em uma instituição pública?

                    	b) QUESTÃO 02 - De acordo com as condições estabelecidas no edital do processo seletivo, a sua renda per capta familiar é igual ou inferior a 1 salário mínimo atualmente? (Renda familiar per capita é calculada dividindo-se o total de renda familiar pelo número de moradores de uma residência).

                    	c) QUESTÃO 03 - Você se identifica como pessoa preta, parda ou indígena?

                    	d) QUESTÃO 04 - Você é membro ou reside em alguma comunidade remanescente de quilombo?

                    	e) QUESTÃO 05 - Você possui alguma deficiência que se enquadra nas condições estabelecidas no edital do processo seletivo para o qual está se inscrevendo e que pode ser comprovada por meio de laudo médico?

                    	3.6. As vagas da Ampla Concorrência são destinadas a todos(as) os(as) candidatos(as) que se julgarem aptos(as) a participar do certame, independentemente da condição social, racial, de deficiência ou de terem cursado o Ensino Fundamental em escola pública ou privada.

                    	3.6.1 Os(as) candidatos(as) que já possuam escolaridade de nível superior somente podem concorrer nas vagas de da Ampla Concorrência.

                    	3.7. Quando ocorrer a existência de vagas em uma determinada ação afirmativa (cota) e a falta de candidatos inscritos para ocupá-las, ocorrerá a convocação de candidatos de outras listas de concorrência, a partir da migração da referida vaga, respeitando a ordem constante no Anexo III.

                   	 

                    	4. DO SISTEMA DE AÇÕES AFIRMATIVAS (COTAS)

                    	4.1 Cotas para Escola Pública

                    	4.1.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de escola pública devem apresentar, no momento da matrícula, histórico escolar por meio do qual comprovem ter cursado e concluído todo o ensino fundamental (1º ao 9º anos ou outra forma prevista em Lei) exclusivamente na rede pública de ensino do Brasil.

                    	4.1.2. Não poderá ser matriculado(a), nas vagas reservadas para as ações Afirmativas (cotas) de Escola Pública, o(a) candidato(a) que tenha cursado o ensino fundamental, integralmente ou em parte, em escolas particulares, inclusive com bolsa de estudos parcial ou integral (Art. 5º, Inciso II b, § 1º da Portaria Normativa nº 18 de 2012). Identificadas disciplinas isoladas realizadas na rede privada de ensino, o(a) candidato(a) também estará impossibilitado(a) de se matricular nestas vagas.

                    	4.1.3. De acordo com o Art. 19, inciso I da Lei nº 9.394, de 20 de dezembro de 1996, considera-se Escola Pública a instituição criada ou incorporada, mantida e administrada pelo poder público. As escolas pertencentes ao Sistema S (SENAI, SESI, SENAC), escolas conveniadas, escolas filantrópicas ou, ainda, fundações ou instituições similares (mesmo que mantenham educação gratuita) não são consideradas instituições da rede pública de ensino.

                    	4.1.4 Caso, no momento da matrícula, o documento a que se refere o item 4.1.1 não seja apresentado ou não comprove a condição de o estudante ter realizado todo o Ensino Fundamental em escola pública, requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

                    	4.1.4.1 Ocorrendo a situação prevista no item 4.1.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VIII que deverá ser preenchido e enviado ao e-mail: recursos@ifpr.edu.br.

                    	4.1.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.1.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

                   	 

                    	4.2. Cotas para Baixa Renda

                    	4.2.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de Baixa Renda deverão comprovar renda familiar bruta igual ou inferior a 1(um) salário-mínimo per capita (equivalente a R$ 1.412,00, de acordo com o DECRETO Nº 11.864, DE 27 DE DEZEMBRO DE 2023).

                    	4.2.2. Para atendimento da condição de baixa renda, deve-se considerar:

                    	a) Família: a unidade nuclear composta por uma ou mais pessoas, eventualmente ampliada por outras pessoas que contribuam para o rendimento ou tenham suas despesas atendidas por aquela unidade familiar, todas moradoras em um mesmo domicílio;

                    	b) Morador: a pessoa que tem o domicílio como local habitual de residência e nele reside na data de inscrição do estudante no processo seletivo da instituição federal de ensino;

                    	c) Renda familiar bruta mensal: a soma dos rendimentos brutos auferidos por todas as pessoas da família, calculada na forma do disposto no Art. 7º da Portaria Normativa nº 18/2012 do MEC.

                    	d) Renda familiar bruta mensal per capita: a razão entre a renda familiar bruta mensal e o total de pessoas da família, calculada na forma do art. 7º da Portaria Normativa Nº 18, de 11 de outubro de 2012 - MEC.

                    	4.2.3. No momento da matrícula, os documentos comprobatórios para análise da renda deverão ser referentes aos 3 meses anteriores ao período de inscrições (julho, agosto e setembro de 2024).

                    	4.2.3.1 Os documentos a que se refere o item 4.2.3 constam no Anexo VII e deverão ser enviados, em um único arquivo, através do Portal do Candidato do IFPR no item “Documentos Comprobatórios de Renda”.

                    	4.2.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

                    	4.2.4.1 Ocorrendo a situação prevista no item 4.2.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VIII que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

                    	4.2.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.2.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

                   	 

                    	4.3 Cotas para Pretos, Pardos ou Indígenas

                    	4.3.1. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa de Pretos, Pardos ou Indígenas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

                    	4.3.2. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

                    	4.3.2.1. Para os candidatos autodeclarados indígenas, quando convocados para a heteroidentificação, deverão apresentar:

                    	a) cópia digitalizada do RANI (Registro de Nascimento Indígena); e/ou

                    	b) declaração de residência/pertencimento à comunidade indígena assinada por 3 (três) autoridades indígenas, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo X; e/ou

                    	c) histórico escolar emitido por escola indígena.

                    	4.3.2.2 As demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

                    	4.3.3. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa preta, parda ou indígena, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas pretas, pardas ou indígenas.

                   	 

                    	4.4 Cotas para Pessoa com Deficiência

                    	4.4.1. Considerar-se-á Pessoa com Deficiência (PcD) aquela que possui impedimento de longo prazo, de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade em igualdade de condições com as demais pessoas, conforme artigo 2º da Lei nº 13.146, de 06 de julho de 2015, e a pessoa com transtorno do espectro autista, de acordo com art. 1º, § 2 o da Lei nº 12.764, de 27 de dezembro de 2012.

                    	4.4.2. Os(As) candidatos(as) inscritos(as) pelo Sistema de Ações Afirmativas (cota) Pessoa com Deficiência deverão se enquadrar:

                    	a) No art. 4º do Decreto nº 3.298, de 20 de dezembro de 1999, atualizado pelo art. 5º, § 1º, inciso I, do Decreto nº 5.296, de 02 de dezembro de 2004, o qual apresenta as seguintes definições:

                    	I - deficiência física: alteração completa ou parcial de um ou mais segmentos do corpo humano, acarretando o comprometimento da função física, apresentando-se sob a forma de paraplegia, paraparesia, monoplegia, monoparesia, tetraplegia, tetraparesia, triplegia, triparesia, hemiplegia, hemiparesia, ostomia, amputação ou ausência de membro, paralisia cerebral, nanismo, membros com deformidade congênita ou adquirida, exceto as deformidades estéticas e as que não produzam dificuldades para o desempenho de funções;

                    	II - deficiência auditiva: perda bilateral, parcial ou total, de quarenta e um decibéis (dB) ou mais, aferida por audiograma nas frequências de 500Hz, 1.000Hz, 2.000Hz e 3.000Hz;

                    	III - deficiência visual: cegueira, na qual a acuidade visual é igual ou menor que 0,05 no melhor olho, com a melhor correção óptica; a baixa visão, que significa acuidade visual entre 0,3 e 0,05 no melhor olho, com a melhor correção óptica; os casos nos quais a somatória da medida do campo visual em ambos os olhos for igual ou menor que 60º; ou a ocorrência simultânea de quaisquer das condições anteriores; visão monocular como deficiência sensorial, do tipo visual (conforme definido na lei nº 14.126 de 22 de março de 2021) .

                    	IV - deficiência intelectual: funcionamento intelectual significativamente inferior à média, com manifestação antes dos dezoito anos e limitações associadas a duas ou mais áreas de habilidades adaptativas, tais como: 1. comunicação; 2. cuidado pessoal; 3. habilidades sociais; 4. utilização dos recursos da comunidade; 5. saúde e segurança; 6. habilidades acadêmicas; 7. lazer; e 8. trabalho;

                    	V - deficiência múltipla - associação de duas ou mais deficiências.

                    	b) No art. 1º, § 1º, incisos I e II, e § 2º, da Lei nº 12.764, de 27 de dezembro de 2012, que apresenta as seguintes definições acerca do Transtorno do Espectro Autista: § 1º Para os efeitos desta Lei, é considerada pessoa com transtorno do espectro autista aquela portadora de síndrome clínica caracterizada na forma dos seguintes incisos I ou I:

                    	I - deficiência persistente e clinicamente significativa da comunicação e da interação sociais, manifestada por deficiência marcada de comunicação verbal e não verbal usada para interação social; ausência de reciprocidade social; falência em desenvolver e manter relações apropriadas ao seu nível de desenvolvimento;

                    	II - padrões restritivos e repetitivos de comportamentos, interesses e atividades, manifestados por comportamentos motores ou verbais estereotipados ou por comportamentos sensoriais incomuns; excessiva aderência a rotinas e padrões de comportamento ritualizados; interesses restritos e fixos. § 2º A pessoa com transtorno do espectro autista é considerada pessoa com deficiência, para todos os efeitos legais.

                    	4.4.3. O(A) candidato(a) aprovado(a) nas vagas reservadas para Pessoas com Deficiência deverá apresentar, no momento da matrícula  através do Portal do Candidato do IFPR, laudo médico assinado por médico responsável que ateste alguma das condições descritas no item 4.4.2.

                    	4.4.3.1. O laudo médico deverá:

                    	a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

                    	b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no item 4.4.2;

                    	c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

                    	4.4.3.2. O(A) candidato(a) inscrito(a) nas vagas reservadas para Pessoas com Deficiência autoriza a utilização pelo IFPR do laudo médico entregue no momento da matrícula.

                    	4.4.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

                    	4.4.4.1 Ocorrendo a situação prevista no item 4.4.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VIII que deverá ser preenchido e enviado ao e-mail: recursos@ifpr.edu.br.

                    	4.4.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.4.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

                    	4.4.5. Caso seja constatada inexatidão ou irregularidade de informações, ainda que posteriormente ao processo seletivo e/ou à matrícula, o(a) candidato(a) será eliminado(a) do Processo Seletivo, declarando-se nulos todos os atos decorrentes de sua inscrição.

                   	 

                    	4.5 Cotas para Quilombolas

                    	4.5.1. Os(As) candidatos(as) inscritos(as) pela ação afirmativa destinada a quilombolas são aqueles que comprovem residência/pertencimento às comunidades remanescentes de quilombo.

                    	4.5.2. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa para quilombolas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

                    	4.5.3. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

                    	4.5.4. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa quilombola, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas quilombolas.

                    	4.5.5. O(A) candidato(a) autodeclarado Quilombola, quando da convocação para a heteroidentificação, deverá apresentar, obrigatoriamente, os seguintes documentos:

                    	a) Autodeclaração étnico-racial devidamente preenchida e assinada conforme Anexo XI;

                    	b) Cópia frente e verso de documento de identificação com foto;

                    	c) Declaração de residência/pertencimento às comunidades remanescentes de quilombo assinada por 3 (três) autoridades de Associação Quilombola reconhecida pela Fundação Palmares, com os respectivos contatos telefônicos das 3 (três) autoridades (modelo disponível aqui).

                    	4.5.6. As comunidades remanescentes de quilombos são apenas aquelas certificadas pela Fundação Cultural Palmares, nos termos do Decreto 4.887/03, de 20/11/2003.

                    	4.5.7. Demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

                   	 

                    	4.6. Todos os(as) candidatos(as) optantes pelo Sistema de Ações Afirmativas (cotas) concorrerão, primeiramente, na Ampla Concorrência e, se não classificados, concorrerão em seu respectivo grupo de Ações Afirmativas (cotas), de acordo com a sequência de prioridades abaixo:

                    	a) IFPR-PPI - candidatos autodeclarados pretos, pardos ou indígenas, independentemente de renda familiar e de ter cursado a etapa anterior em escola pública.

                    	b) IFPR-PCD - candidatos com deficiência, independentemente de renda familiar e de ter cursado a etapa anterior integralmente em escola pública.

                    	c) EP - estudantes que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	d) EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	e) EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	f) EP-PPI -  Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

                    	g) BR-EP - candidatos que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	h) BR-EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	i) BR-EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	j) BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

                    	4.7 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) constarão apenas na lista geral da Ampla Concorrência, não precisando fazer qualquer comprovação quanto às ações afirmativas para as quais foi previamente classificado.

                   	 

                    	Cronograma do Processo Seletivo
O cronograma do processo seletivo está organizado da seguinte forma:

Fase de Inscrição:

20/09/2024: Publicação do Edital no site institucional.

01/11/2024: Início do período de inscrição on-line.

03/10/2024 a 25/10/2024: Período de isenção de taxa de inscrição.

30/10/2024: Divulgação da Relação Nominal com resultado preliminar do pedido de isenções concedidas.

31/10/2024: Prazo para interposição de recursos contra a Relação Nominal com resultado do pedido de isenções concedidas.

04/11/2024: Divulgação da Relação Nominal com resultado definitivo do pedido de isenções concedidas.

06/11/2024: Prazo final para pagamento da taxa de inscrição.

Homologação das Inscrições:

13/11/2024: Publicação da lista preliminar das inscrições homologadas no Processo Seletivo.

14/11/2024: Prazo para interposição de recurso referente à homologação de inscrições.

18/11/2024: Análise dos recursos contra o Resultado da lista preliminar dos inscritos no Processo Seletivo.

19/11/2024: Publicação final das inscrições homologadas.

Análise e Classificação:

27/11/2024: Análise dos históricos.

28/11/2024: Publicação da classificação preliminar.

29/11/2024: Prazo para interposição de recurso referente à classificação preliminar.

03/12/2024: Publicação do resultado dos recursos referentes à classificação preliminar.

Ações Afirmativas/Cotas Sociais:

05/12/2024 a 16/12/2024: Convocação dos candidatos inscritos nas vagas das ações afirmativas/cotas sociais para realização do processo de heteroidentificação e entrega de documentos para comprovação da condição de cotista.

17/12/2024: Bancas de heteroidentificação e análise pelas comissões dos documentos entregues.

19/12/2024: Publicação do resultado preliminar da heteroidentificação e análise documental.

19/12/2024 a 20/12/2024: Prazo para interposição de recurso contra o resultado preliminar da heteroidentificação e análise documental.

20/12/2024: Análise dos recursos pela Coordenação de Ações Inclusivas e comissão recursal de heteroidentificação.

23/12/2024: Publicação do resultado final do processo de heteroidentificação.

Resultado Final e Matrícula:

23/12/2024: Publicação do Resultado Final do Processo Seletivo.

20/01/2025 a 24/01/2025: Convocação para matrícula da 1o chamada.

24/01/2025 a 28/01/2025: Período de matrícula para os candidatos convocados na 1o chamada.

28/01/2025: Divulgação do resultado provisório das matrículas.

29/01/2025 a 31/01/2025: Prazo para recurso contra o resultado provisório das matrículas.

31/01/2025: Divulgação do resultado definitivo das matrículas.

                   	 

                    	6. DAS INSCRIÇÕES

                    	6.1 As inscrições devem ser feitas através do Portal do Candidato do IFPR que pode ser acessado através link https://portaldocandidato.ifpr.edu.br/.

                    	6.1.1 Para fazer seu login no Portal do Candidato do IFPR, o candidato deverá utilizar sua conta pessoal gov.br.

                    	6.1.2 Caso não possua conta gov.br, o candidato deverá realizar o seu cadastro, conforme tutorial que pode ser acessado a partir do link dos vídeos tutoriais disponível no item 1.1.1.

                    	6.2 A inscrição do(a) candidato(a) implicará ciência e aceitação das normas e condições estabelecidas no inteiro teor deste edital, das quais não poderá alegar desconhecimento.

                    	6.3 No ato da inscrição, o(a) candidato(a) deverá preencher integralmente o formulário de inscrição e indicar:

                    	a) responder ao questionário a que se refere o item 3.5.1 deste Edital;

                    	b) conferir e confirmar as ações afirmativas para as quais estará concorrendo;

                    	c) preencher todos os dados solicitados;

                    	d) informar a média de Língua Portuguesa e de Matemática, relativas aos 1º e 2º  do Ensino Médio, conforme o histórico escolar apresentado ou conforme exame nacional para certificação de competências de jovens e adultos (Encceja) ou de exames de certificação de competência ou de avaliação de jovens e adultos realizados pelos sistemas estaduais de ensino ou provas do Exame Nacional do Ensino Médio - Enem: Matemática e suas Tecnologias; Linguagens, Códigos e suas Tecnologias

                    	e) realizar o upload do comprovante oficial de notas do Ensino Médio;

                    	f) confirmar a inscrição.

                    	6.4 O(A) candidato(a) deverá seguir as orientações dispostas no Anexo IV  para indicar  a sua média.

                    	6.4.1 Para a indicação da média dos componentes curriculares Língua Portuguesa e Matemática devem ser considerados os dois primeiros anos do Ensino Médio, como disposto no ANEXO IV.

                    	6.4.2 Nos casos em que o histórico escolar expressa os resultados por meio de conceitos ou quaisquer outras formas de indicação, o(a) candidato(a) deverá utilizar a seguinte tabela de conversão:

                    	Indicação de Aprendizagem
Este cronograma apresenta uma escala de notas e suas correspondentes indicações de aprendizagem.

Aprovado:

Nota 10: A ou A+

Nota 10: A-

Nota 9: B ou B+

Nota 8,5: B-

Nota 7,5: C ou C+

Nota 7: C-

Nota 6: C-

                    	6.4.3 Na modalidade Ensino Médio via Certificação do Encceja (Exame Nacional para Certificação de Competências de Jovens e Adultos) ou ENEM (Exame Nacional do Ensino Médio), o(a) candidato(a) deverá considerar a pontuação obtida nas áreas de conhecimento Linguagens, Códigos e suas Tecnologias e Matemática e suas Tecnologias.

                    	6.5 O(A) candidato(a) deve atentar-se ao correto preenchimento dos campos de notas, conforme orientações do Anexo IV, a depender do caso.

                    	6.6 As informações fornecidas no formulário de inscrição e o seu correto preenchimento são de responsabilidade do(a) candidato(a), dispondo o IFPR do direito de excluir do processo de ingresso aquele que não preencher a solicitação de inscrição de forma completa e correta, bem como aquele que fornecer dados comprovadamente inverídicos.

                    	6.7 Após o preenchimento dos formulários o candidato deverá realizar o pagamento da taxa no valor de R$30,00 (trinta reais) ou solicitar a isenção de inscrição.

                    	6.7.1 Para realizar o pagamento da taxa de inscrição, o candidato deverá gerar, no Portal do Candidato do IFPR, boleto de pagamento em nome da FUNTEF-PR - Fundação de Apoio à UTFPR.

                    	6.7.2 Caso o candidato solicite isenção do valor da inscrição, deverá seguir as instruções constantes no item 7 do Edital.

                    	6.7.2.1 Em caso de indeferimento no pedido de isenção, o candidato deverá pagar a taxa de inscrição, conforme dispõe os itens 6.6 e 6.6.1, respeitados os prazos constantes no cronograma deste edital.

                   	 

                    	7. DAS ISENÇÕES DE TAXA DE INSCRIÇÃO

                    	7.1 A solicitação de isenção da taxa de inscrição se dará conforme o disposto no Decreto nº 6.593/2008.

                    	7.2. São requisitos para o(a) candidato(a) solicitar a isenção de pagamento da taxa de inscrição:

                    	a) estar inscrito(a) no Cadastro Único para Programas Sociais do Governo Federal (CadÚnico);

                    	b) conforme disposto no Decreto nº 11.016/2022, ter perfil de família com renda mensal per capita (por pessoa) de até meio salário mínimo (R$ 706,00).

                    	7.3. Para solicitar a isenção da taxa de inscrição, o(a) candidato(a) deverá realizar os seguintes procedimentos:

                    	a) realizar sua inscrição no Portal do Candidato, conforme descrito no item 6.1;

                    	b) preencher o formulário de requerimento de isenção, disponível no Anexo VI. O formulário deverá ser assinado pelo(a) responsável do(a) candidato(a);

                    	c) providenciar os documentos comprobatórios solicitados no Anexo VI;

                    	d) digitalizar a carteira de identificação (CI) com foto do(a) candidato(a);

                    	e) enviar o formulário, a digitalização da carteira de identificação e os demais documentos comprobatórios no local indicado no Portal do Candidato.

                    	7.3.1. Serão aceitos os documentos enviados até a data limite para solicitar a isenção, definida no cronograma do item 5 deste edital.

                    	7.3.2. Candidatos(as) oriundos(as) da mesma família deverão preencher o formulário de requerimento de forma individual.

                    	7.3.3. Não será permitido o envio de quaisquer itens/documentos por correio postal ou e-mail que não seja o formulário online disponível no Portal do Candidato.

                    	7.4. Terá o seu requerimento de isenção da taxa de inscrição indeferido o(a) candidato(a) que:

                    	a) não apresentar, de forma completa, a documentação exigida no item 7.3;

                    	b) preencher de forma incorreta o formulário de requerimento (Anexo VI).

                    	7.5. A análise das solicitações será executada pela Equipe de Assessoramento do Processo Seletivo 2025 do IFPR, que irá avaliar as informações prestadas no formulário de requerimento e demais documentos anexados.

                    	7.5.1. O resultado das solicitações será publicado conforme data definida no cronograma do item 5 deste edital.

                    	7.6 Caso o candidato tenha entregado os documentos corretos, mas por algum motivo seu pedido tenha sido indeferido ele poderá fazer recurso através do formulário (Anexo VII) e enviá-lo através do e-mail: recursos@ifpr.edu.br.

                    	7.6.1. O recurso será avaliado pela Equipe de Assessoramento do Processo Seletivo 2025 do IFPR.

                    	7.7. A concessão de isenção da taxa de inscrição é pessoal e intransferível.

                    	7.8. O(A) candidato(a), cuja solicitação de isenção da taxa de inscrição for indeferida, deverá realizar o pagamento da taxa de inscrição, até a data limite, conforme orientações contidas nos itens 6.7 e 6.8 deste edital.

                   	 

                    	8. DA CLASSIFICAÇÃO

                    	8.1 A classificação será realizada em ordem decrescente da média gerada a partir das notas de Língua Portuguesa e Matemática informadas pelos(as) candidatos(as).

                    	8.1.1 A média a que se refere o item 8.1 se dará numa escala de 0,00 (zero vírgula zero) a 10,00 (dez vírgula zero) e será calculada automaticamente pelo Portal do Candidato a partir das notas lançadas pelo(a) candidato(a).

                    	8.1.2 Todos(as) os(as) candidatos(as) constarão na lista de classificação da Ampla Concorrência.

                    	8.1.3 Além da lista da Ampla Concorrência, os(as) candidatos(as) constarão nas listas de todas as ações afirmativas as quais tenham sido enquadrados conforme item 3.5 deste edital.

                    	8.1.4 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) serão classificados(as) apenas na lista geral da Ampla Concorrência.

                    	8.2 No caso de empate, será considerada a seguinte regra para o desempate:

                    	a) maior idade; e

                    	b) persistindo o empate, sorteio.

                    	8.3 Anteriormente à publicação da classificação preliminar, as médias e notas informadas serão conferidas com o comprovante oficial de notas, submetido no formulário de inscrição.

                    	8.3.1 Se constatada divergência nas notas ou média informada, devido ao não atendimento das orientações do Anexo IV, a média do(a) candidato(a) poderá ser recalculada pela subcomissão de matrícula do campus, para que sejam atendidas na íntegra as referidas orientações.

                    	8.3.2 Se constatados equívocos na média ou notas informadas pelo candidato, a média final do(a) candidato(a) será ajustada com o valor correto.

                    	8.3.2.1 Caso o documento oficial contendo as notas impossibilite a devida conferência, a nota do(a) candidato(a) será definida como 0 (zero).

                   	 

                   	 

                    	9. DOS RESULTADOS

                    	9.1. O resultado preliminar do Processo Seletivo será divulgado em data definida pelo cronograma disponível no item 5 deste edital, no Portal do Candidato (https://portaldocandidato.ifpr.edu.br/)

                    	9.2. Caberá recurso contra a classificação preliminar. O recurso deverá ser protocolado de forma online através do Portal do Candidato (https://portaldocandidato.ifpr.edu.br/) em datas definidas no cronograma disponível no item 5 deste edital.

                    	9.2.1. A Equipe de Assessoramento do Processo Seletivo 2025 do IFPR avaliará as informações prestadas no formulário de recurso referente à classificação, deferindo ou não o pedido.

                    	9.3. O resultado final será constituído da lista geral de classificação pela ampla concorrência e por cada uma das ações afirmativas (cotas), para cada campus e curso.

                    	9.3.1. A lista geral de classificação em cada uma das ações afirmativas poderá sofrer alterações durante o processo de heteroidentificação e da análise dos documentos de matrícula dos(as) candidatos(as) inscritos(as) nas ações afirmativas de Baixa Renda, PcD e Escola Pública.

                    	9.4. Respeitado o disposto no item 4.6 deste edital, os candidatos aprovados dentro das vagas previstas serão convocados para matrícula em primeira chamada.

                    	9.4.1 Após as matrículas a que se refere o item 9.4 e que estão descritas no título 10, poderão ocorrer chamadas complementares, caso algum candidato previamente convocado não confirme sua matrícula.

                   	 

                    	10. DAS MATRÍCULAS

                    	10.1. A matrícula será permitida ao(à) candidato(a) que apresentar toda a documentação exigida e tenha concluído o Ensino Médio.

                    	10.2. A matrícula dos candidatos(as) aprovados(as) nas chamadas do Processo Seletivo ocorrerá respeitando as vagas disponíveis, a ordem de classificação estabelecida conforme resultado do Exame de Classificação e o Sistema de Ações Afirmativas (cotas).

                    	10.3. As matrículas dos(as) candidatos(as) aprovados(as) deverão ser realizadas de forma online, exclusivamente no Portal do Candidato do IFPR (https://portaldocandidato.ifpr.edu.br/), por meio do login na conta individual de cada candidato(a).

                    	10.3.1. O(A) candidato(a) deverá acessar o Portal do Candidato e realizar o upload dos documentos solicitados conforme o período definido no cronograma.

                    	10.4. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação do edital e as chamadas de candidatos(as) aprovados(as).

                    	10.5. O(A) candidato(a) que não realizar sua matrícula, conforme datas e definições do edital, perderá o direito à vaga, possibilitando que o(a) próximo(a) candidato(a) da lista de classificação seja convocado(a).

                    	10.5.1 Ocorrendo a situação prevista no item 10.5, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VII que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

                    	10.6. Os documentos para matrícula, comuns a todos(as) os(as) candidatos(as), são:

                    	10.6.1 Carteira de identidade;

                    	10.6.1.1 Se candidato(a) estrangeiro(a), em substituição ao documento previsto no item 10.6.1, deve ser apresentado: documento de identidade nacional de estrangeiro (Carteira de Registro Nacional Migratório - CRNM) ou Residência Mercosul, emitida por autoridade brasileira, válida à data da matrícula;

                    	10.6.2 Certidão de nascimento ou Certidão de Casamento;

                    	10.6.3 Certificado de Alistamento Militar, de Dispensa de Incorporação ou de Reservista, no caso dos candidatos do sexo masculino maiores de 18 anos e com idade até 45 anos;

                    	10.6.4 Declaração de vacinação (para candidatos com menos de 18 (dezoito) anos) emitida e assinada por profissional de saúde, atestando que o adolescente está com o seu esquema vacinal de acordo com a recomendação estabelecida no Programa Nacional de Imunização – PNI, do Ministério da Saúde e da Secretaria de Estado da Saúde;

                    	10.6.5. Uma via impressa da certidão de quitação eleitoral (para candidatos com mais de 18 (dezoito) anos que já possuem titulo eleitoral), que poderá ser obtida em qualquer Cartório Eleitoral e também na página eletrônica www.tse.jus.br.

                    	10.6.6 Certificado de conclusão do Ensino Médio ou equivalente que comprove a conclusão do Ensino Médio;

                    	10.6.6.1 Poderá ser apresentada Declaração de Conclusão do Ensino Médio, desde que, num prazo de 60 (sessenta) dias, o histórico seja apresentado à Secretaria Acadêmica do campus;

                    	10.6.6.2 O candidato que realizou seus estudos em instituições estrangeiras, além da documentação e procedimentos definidos neste Edital, também deve entregar Comprovante de Conclusão de Ensino Médio, revalidado no Brasil na forma da lei.
                    	10.6.6.2.1 É dispensada a revalidação se o comprovante de conclusão de estudos pertencer a um país integrante do Mercosul.

                    	10.6.7 Formulário de Requerimento de Matrícula devidamente preenchido pelo responsável legal em caso de candidatos menores de 18 anos (conforme Anexo IX); e

                    	10.6.8 Documento de Identificação do Responsável Legal para menores de 18 anos.

                    	10.7. Os documentos necessários para comprovação das Ações Afirmativas (cotas) de Baixa Renda, Pessoa com Deficiência e Escola Pública são:

                    	10.7.1 AÇÃO AFIRMATIVA DE ESCOLA PÚBLICA: Os candidatos deverão apresentar, no momento da matrícula, Histórico Escolar por meio do qual comprovem ter cursado e concluído todo o ensino médio (do primeiro ao terceiro anos, ou equivalente) exclusivamente na rede pública de ensino do Brasil.

                    	10.7.2 AÇÃO AFIRMATIVA DE PESSOA COM DEFICIÊNCIA: Laudo médico atestando a espécie e o grau da deficiência. O laudo deverá:

                    	a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

                    	b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no edital do processo seletivo;

                    	c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

                    	10.7.3 AÇÃO AFIRMATIVA DE BAIXA RENDA: documentos especificados no Anexo VII deste Edital.

                    	10.8  O estudante que ingressar mediante processo seletivo tendo efetuado seu registro acadêmico, deverá realizar a confirmação de sua matrícula devendo possuir frequência a pelo menos uma das aulas previstas para os 5 (cinco) primeiros dias letivos do calendário acadêmico do campus.

                    	10.8.1 A não realização da confirmação de matrícula pelo estudante ou de pessoa por ele autorizada para tal, caracterizar-se-á como desistência, o que ocasionará o cancelamento do seu registro acadêmico.

                   	 

                    	11. DAS DISPOSIÇÕES FINAIS

                    	11.1. A Comissão Central do Processo Seletivo, a  Equipe de Assessoramento do Processo Seletivo e o IFPR não se responsabilizam por solicitação de inscrição via internet não efetivada por motivos de ordem técnica, falhas de comunicação, congestionamento de linhas de comunicação ou quaisquer outros fatores de ordem técnica que impossibilitem a transferência dos dados ou a impressão de documentos.

                    	11.2. A inscrição do(a) candidato(a) implicará a aceitação total e incondicional das normas e instruções constantes neste edital.

                    	11.3. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação dos resultados das etapas do Processo Seletivo através do Portal do Candidato do IFPR (https://portaldocandidato.ifpr.edu.br/).

                    	11.4. A inexatidão ou irregularidade de informações, ainda que constatada posteriormente ao processo seletivo e/ou à matrícula, eliminará o(a) candidato(a) do Processo Seletivo, declarando-se nulos todos os atos decorrentes de sua inscrição.

                    	11.5 Após esgotadas as chamadas complementares previstas no item 9.4.1 e persistindo a existência de vagas não ocupadas, novo processo seletivo será realizado com regramento a ser publicado em edital próprio.

                    	11.6 Os candidatos que não têm acesso a equipamento e/ou internet poderão dirigir-se a um dos campi do IFPR (de acordo com os endereços indicados no Anexo V), de segunda-feira a sexta-feira, no horário de funcionamento do campus, no período destinado às inscrições.

                    	11.7. Os casos omissos e as situações não previstas no presente edital serão analisados pela Comissão Central do Processo Seletivo e pela Equipe de Assessoramento do Processo Seletivo.

                    	Curitiba, 20 de setembro de 2024.

                   	 

                   	 

                   	 

                    	Assinado:
                    	logotipo	 

                    	Documento assinado eletronicamente por ADRIANO WILLIAN DA SILVA VIANA PEREIRA, Reitor, em 20/09/2024, às 21:20, conforme horário oficial de Brasília, com fundamento no art. 6º, caput, do Decreto nº 8.539, de 8 de outubro de 2015.
                    	QRCode Assinatura	 

                    	A autenticidade deste documento pode ser conferida no site https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&id_orgao_acesso_externo=0, informando o código verificador 3185078 e o código CRC 3103DDC4.

                    	ANEXO I - EDITAL Nº 88, DE 20 DE SETEMBRO DE 2024

                    	Oferta de Cursos Técnicos Subsequentes ao Ensino Médio - 2023

Campus | Curso | Nível de Ensino | Forma de Oferta | Turmas | Turno | Vagas | Duração do Curso
------- | -------- | -------- | -------- | -------- | -------- | -------- | --------
Arapongas | Técnico em Melhoria de Processos | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Assis Chateaubriand | Técnico em Agropecuária | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Assis Chateaubriand | Técnico em Alimentos | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Assis Chateaubriand | Técnico em Eletromecânica | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Assis Chateaubriand | Técnico em Eletrotécnica | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Astorga | Técnico em Desenvolvimento de Sistemas | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Campo Largo | Técnico em Mecânica | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Curitiba | Técnico em Condomínio | Médio | Subsequente | 1 | Noturno | 40 | 1 ano
Curitiba | Técnico em Edificações | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Curitiba | Técnico em Eletromecânica | Médio | Subsequente | 1 | Noturno | 30 | 2 anos
Curitiba | Técnico em Eletrotécnica | Médio | Subsequente | 1 | Noturno | 35 | 2 anos
Curitiba | Técnico em Enfermagem | Médio | Subsequente | 1 | Matutino | 30 | 2 anos
Curitiba | Técnico em Eventos | Médio | Subsequente | 1 | Noturno | 35 | 1 ano
Curitiba | Técnico em Mecânica | Médio | Subsequente | 1 | Noturno | 36 | 2 anos
Curitiba | Técnico em Processos Fotográficos | Médio | Subsequente | 1 | Matutino | 30 | 1,5 anos
Curitiba | Técnico em Produção de Áudio e Vídeo | Médio | Subsequente | 1 | Noturno | 30 | 2 anos
Curitiba | Técnico em Prótese Dentária | Médio | Subsequente | 1 | Vespertino | 25 | 2 anos
Curitiba | Técnico em Prótese Dentária | Médio | Subsequente | 1 | Noturno | 25 | 2 anos
Curitiba | Técnico em Radiologia | Médio | Subsequente | 1 | Matutino | 35 | 2 anos
Curitiba | Técnico em Telecomunicações | Médio | Subsequente | 1 | Noturno | 36 | 2 anos
Foz do Iguaçu | Técnico em Gastronomia | Médio | Subsequente | 1 | Vespertino | 22 | 1 ano
Jacarezinho | Técnico em Teatro | Médio | Subsequente | 1 | Noturno | 30 | 2 anos
Londrina | Técnico em Enfermagem | Médio | Subsequente | 1 | Diurno¹ | 30 | 2 anos
Londrina | Técnico em Massoterapia | Médio | Subsequente | 1 | Matutino | 40 | 2 anos
Londrina | Técnico em Prótese Dentária | Médio | Subsequente | 1 | Noturno | 40 | 2 anos
Londrina | Técnico em Saúde Bucal | Médio | Subsequente | 1 | Noturno | 30 | 2 anos
Paranavaí | Técnico em Eletromecânica | Médio | Subsequente | 1 | Noturno | 40 | 2 anos


                    	¹O curso cujo turno está assinalado como sendo “Diurno”, aparece no Portal do Candidato do IFPR como turno “Integral”, sem prejuízo à informação deste quadro de vagas e a consequente necessidade de o estudante cumpri-la.


                   	 

                    	ANEXO II - EDITAL Nº 88, DE 20 DE SETEMBRO DE 2024

                    	Distribuição de Vagas por Faixas de Ação Afirmativa
O processo seletivo conta com diferentes faixas de ação afirmativa, com o intuito de garantir a inclusão e a diversidade na formação de estudantes:

Estudantes que tenham cursado a etapa anterior integralmente em Escola Pública (60% das vagas): Destinada a candidatos que realizaram seus estudos em escolas públicas, buscando ampliar o acesso ao ensino superior para aqueles que tiveram sua trajetória escolar nesse sistema.

Ações afirmativas - IFPR (15% das vagas): Ações afirmativas específicas do Instituto Federal do Paraná, com critérios próprios para beneficiar grupos específicos e promover a equidade.

Ampla Concorrência (25% das vagas): Destinada a todos os candidatos, sem critérios específicos de acesso, abrindo oportunidade para todos aqueles que atendem aos requisitos básicos do processo seletivo.

Dentro da faixa de estudantes que tenham cursado a etapa anterior integralmente em Escola Pública, as vagas são divididas em duas categorias:

Estudantes que possuam renda bruta familiar per capita igual ou inferior a 1 salário mínimo (30% das vagas): Prioriza o acesso de estudantes de baixa renda, garantindo oportunidades para aqueles que enfrentam dificuldades financeiras.

Estudantes que possuam renda bruta familiar per capita superior a 1 salário mínimo (30% das vagas): Abrange estudantes com renda familiar superior a um salário mínimo, mas que também cursaram o ensino anterior em escolas públicas, completando a oferta de vagas para essa faixa.

Número de Vagas Ofertadas por Campus, Curso e Turno:

A tabela a seguir apresenta a distribuição de vagas por campus, curso e turno, considerando as diferentes faixas de ação afirmativa. As siglas utilizadas na tabela representam:

BR-EP-PPI: Bacharelado, Escola Pública, Pessoa com Necessidades Específicas (PPI).

BR-EP-Q: Bacharelado, Escola Pública, Quilombola.

BR-EP-PCD: Bacharelado, Escola Pública, Pessoas com Deficiência (PCD).

BR-EP: Bacharelado, Escola Pública.

EP-PPI: Escola Pública, Pessoa com Necessidades Específicas (PPI).

EP-Q: Escola Pública, Quilombola.

EP-PCD: Escola Pública, Pessoas com Deficiência (PCD).

EP: Escola Pública.

IFPR-PPI: Ações afirmativas - IFPR, Pessoa com Necessidades Específicas (PPI).

IFPR-PCD: Ações afirmativas - IFPR, Pessoas com Deficiência (PCD).

AC: Ampla Concorrência.


                    	OBSERVAÇÃO: O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, seguem o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas cotas não atendam os percentuais indicados no título.

                   	 

                    	ANEXO III - EDITAL Nº 88, DE 20 DE SETEMBRO DE 2024

                    	MAPA DE MIGRAÇÃO DAS VAGAS EM AÇÕES AFIRMATIVAS SEM CANDIDATOS APTOS A OCUPÁ-LAS

                    	SOBROU VAGA AQUI
                       	 

                    	1º VAI PARA:
                       	 

                    	2º VAI PARA:
                       	 

                    	3º VAI PARA:
                       	 

                    	4º VAI PARA:
                       	 

                    	5º VAI PARA:
                       	 

                    	6º VAI PARA:
                       	 

                    	7º VAI PARA:
                       	 

                    	8º VAI PARA:
                       	 

                    	9º VAI PARA:
                       	 

                    	10º VAI PARA:

                    	IFPR-PPI
                       	 

                    	IFPR-PCD
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	IFPR-PCD
                       	 

                    	IFPR-PPI
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	BR-EP-Q
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	BR-EP-PCD
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	BR-EP
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	EP-PPI
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	EP-Q
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-PCD
                       	 

                    	EP
                       	 

                    	AC

                    	EP-PCD
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP
                       	 

                    	AC

                    	EP
                       	 

                    	BR-EP-PPI
                       	 

                    	BR-EP-Q
                       	 

                    	BR-EP-PCD
                       	 

                    	BR-EP
                       	 

                    	EP-PPI
                       	 

                    	EP-Q
                       	 

                    	EP-PCD
                       	 

                    	AC

                   	 

                    	ANEXO IV - EDITAL Nº 88, DE 20 DE SETEMBRO DE 2024

                    	ORIENTAÇÕES PARA INSCRIÇÃO E CÁLCULO DA MÉDIA DOS COMPONENTES CURRICULARES DE MATEMÁTICA E LÍNGUA PORTUGUESA DE CONCLUSÃO DO ENSINO MÉDIO

                    	1. A média final deverá ser expressa de 0,00 (zero) a 10,00 (dez), utilizando-se duas casas após a vírgula.

                    	a) Deve-se indicar as notas de Língua Portuguesa e Matemática do PRIMEIRO ano.

                    	b) Deve-se indicar as notas de Língua Portuguesa e Matemática do SEGUNDO  ano.

                    	c) O sistema fará a média das notas.

                    	d) Ao calcular suas médias, o(a) candidato(a) deverá considerar as seguintes situações:

                    	e) Caso o histórico contenha notas em escalas diferentes de 0(zero) a 10(dez), as notas devem ser convertidas antes de realizar o cálculo da média geral. Por exemplo, no caso da nota estar representada no formato 88, esta deve ser transformada para 8,8(88 ÷ 10).

                    	f) Caso o histórico venha com conceitos e não notas, respeitar a tabela indicada no item 6.4.3 deste edital.

                    	g) Estudantes que possuem em seu histórico escolar registro de disciplinas (Português e/ou Matemática) com dependência, deverão considerar a nota obtida após aprovação na referida disciplina de dependência. Por exemplo, o estudante ficou em dependência na disciplina A em seu 1º ano do ensino médio, vindo a cursar a dependência desta disciplina no 2º ano. Ao calcular a média do primeiro ano, deverá ser considerada, para a disciplina A, a nota obtida na dependência cursada durante o 2º ano.

                   	 

                    	2. Para a modalidade Ensino Médio via Certificação do Encceja (Exame Nacional para Certificação de Competências de Jovens e Adultos) ou do Exame Nacional do Ensino Médio (ENEM)

                    	a) O(A) candidato(a) deverá informar a pontuação obtida nas áreas de conhecimento Linguagens, Códigos e suas Tecnologias e Matemática e suas Tecnologias.

                    	b) O sistema fará a média.
`;
            var edital89 = `Edital N°89, de 20 de setembro de 2024

PROCESSO SELETIVO IFPR 2025 - CURSOS SUPERIORES DE LICENCIATURA

 

O Reitor do Instituto Federal de Educação, Ciência e Tecnologia do Paraná, no uso da competência que lhe confere o Decreto de 06 de fevereiro de 2024, publicado no Diário Oficial da União no dia 07 de fevereiro de 2024, seção 2, página 01, torna público as normas que regem o Processo Seletivo IFPR 2025 para ingresso nos Cursos Superiores de Licenciatura, na modalidade presencial, ofertados para o ano de 2025, considerando a política de inclusão do IFPR para o ingresso de estudantes nos cursos. As inscrições estarão abertas de 03 de outubro de 2024 a 17 de janeiro de 2025.

 

BASE LEGAL

Lei nº 9.394, de 20 de dezembro de 1996 - Estabelece as diretrizes e bases da educação nacional.

Decreto nº 3.298, de 20 de dezembro de 1999 - Regulamenta a Lei no 7.853, de 24 de outubro de 1989, dispõe sobre a Política Nacional para a Integração da Pessoa Portadora de Deficiência, consolida as normas de proteção, e dá outras providências.

Decreto nº 5.296, de 02 de dezembro de 2004 - Regulamenta as Leis nos 10.048, de 8 de novembro de 2000, que dá prioridade de atendimento às pessoas que especifica, e 10.098, de 19 de dezembro de 2000, que estabelece normas gerais e critérios básicos para a promoção da acessibilidade das pessoas portadoras de deficiência ou com mobilidade reduzida, e dá outras providências.

Lei nº 12.711, de 29 de agosto de 2012 - Dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio e dá outras providências.

Lei nº 12.764, de 27 de dezembro de 2012 - Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista; e altera o § 3º do art. 98 da Lei nº 8.112, de 11 de dezembro de 1990.

Decreto nº 7.824, de 11 de outubro de 2012 - Regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

Lei nº 13.146, de 06 de julho de 2015 - Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).

Lei nº 13.409, de 28 de dezembro de 2016 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre a reserva de vagas para pessoas com deficiência nos cursos técnico de nível médio e superior das instituições federais de ensino.

Decreto nº 9.034, de 20 de abril de 2017 - Altera o Decreto n º 7.824, de 11 de outubro de 2012, que regulamenta a Lei n º 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

Lei nº 14.126 de 22 de março de 2021 - Classifica a visão monocular como deficiência sensorial, do tipo visual.

Lei nº 14.723 de 13 de novembro de 2023 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre o programa especial para o acesso às instituições federais de educação superior e de ensino técnico de nível médio de estudantes pretos, pardos, indígenas e quilombolas e de pessoas com deficiência, bem como daqueles que tenham cursado integralmente o ensino médio ou fundamental em escola pública.

Decreto nº 11.781 de 14 de novembro de 2023 - Altera o Decreto nº 7.824, de 11 de outubro de 2012, que regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

Decreto Nº 11.864, de 27 de dezembro de 2023 - Dispõe sobre o valor do salário mínimo a vigorar a partir de 1º de janeiro de 2024.

Portaria Normativa MEC nº 18, de 11 de outubro de 2012 - Dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei no 12.711, de 29 de agosto de 2012, e o Decreto no 7.824, de 11 de outubro de 2012.

Portaria Normativa nº 2.027 de 16 de novembro de 2023 - Altera a Portaria Normativa MEC nº 18, de 11 de outubro de 2012, que dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei nº 12.711, de 29 de agosto de 2012, e a Portaria Normativa MEC nº 21, de 5 de novembro de 2012, que dispõe sobre o Sistema de Seleção Unificada - Sisu.

Resolução Consup/IFPR nº 190/2024 – Dispõe sobre a Organização Didático-Pedagógica dos Cursos Técnicos de Nível Médio na modalidade presencial do Instituto Federal de Educação, Ciência e Tecnologia do Paraná.

Resolução Consup/IFPR nº 55/2011 – Dispõe sobre a Organização Didático Pedagógica da Educação Superior no âmbito do Instituto Federal do Paraná – IFPR.

 

1. DAS DISPOSIÇÕES PRELIMINARES

1.1. Os cursos de licenciatura, objeto deste certame, são públicos, gratuitos e presenciais, devendo o(a) candidato(a) ter disponibilidade de tempo para realizar atividades no contraturno e/ou aos sábados, conforme o calendário acadêmico do campus e o projeto pedagógico do curso.

1.1.1 Alguns cursos podem possuir parte de sua carga horária à distância, conforme a legislação vigente e o seu projeto pedagógico de curso.

1.1.2 Os cursos de Química e de Educação Física do Campus Palmas são cursos de graduação, com dupla possibilidade de formação - bacharelado e licenciatura. Para efeitos de compreensão deste edital, sempre que se citar licenciatura, faz-se referência também a essas duas graduações.

1.1.3 Para acessar tutoriais em vídeo sobre o processo seletivo (com acessibilidade), utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/tutoriais/.

1.1.4 Para acessar formulários e outros documentos editáveis, utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/documentos/.

1.1.5 Para acessar o Portal do Candidato do IFPR, utilize o endereço eletrônico https://portaldocandidato.ifpr.edu.br/.

1.2. Ao término do curso, o estudante fará jus ao diploma de licenciado na respectiva área de conhecimento.

1.2.1 As Graduações em Química e em Educação Física do Campus Palmas possuem possibilidade de diplomação em licenciatura e/ou bacharelado, com critérios para destinação de vagas estabelecidos nos Projetos Pedagógicos de Curso, que podem ser acessados nos links https://ifpr.edu.br/palmas/about/nossos-cursos/about-nossos-cursos-cursos-de-graduacao-regulamentos/educacao-fisica/ppc-educacao-fisica/ e ttps://ifpr.edu.br/palmas/about/nossos-cursos/about-nossos-cursos-cursos-de-graduacao-regulamentos/quimica-9/ppc-quimica/

1.3. Para ingresso nos Cursos de Licenciatura, o candidato deverá ter concluído, imprescindivelmente, o Ensino Médio até a data da matrícula.

1.4. O processo seletivo será realizado em uma única etapa, que consistirá na classificação do(a) candidato(a) pelo seu desempenho (notas) obtidas no Exame Nacional de Ensino Médio (ENEM) dos últimos dez anos (entre 2015 e 2024), conforme detalhado no item 6, deste Edital.

1.5 É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação de todos os atos, editais e comunicados referentes ao Processo Seletivo regido por este edital.

1.6 O(A) candidato(a) que se inscrever pelo Sistema de Ações Afirmativas (cotas) automaticamente autoriza a divulgação dos resultados do Processo Seletivo referente a este edital de acordo com a classificação gerada pelo Sistema de Ações Afirmativas (cotas), nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023.

1.7 O(A) candidato(a) deverá possuir Carteira de Identidade (CI) e Cadastro de Pessoa Física (CPF) para participar do referido processo seletivo.

1.8 Serão considerados documentos de identificação: Carteira de Identidade expedida pelas Secretarias de Segurança Pública, pelas Forças Armadas Brasileiras, por países que possuem acordos diplomáticos com o Brasil, Polícias Militares, Ordens ou Conselhos que, por Lei Federal, tenha validade como documento de identidade e possibilite a conferência da foto e da assinatura; Carteira de Identidade Nacional - CIN; Carteira de Trabalho e Previdência Social(CTPS); Passaporte; ou Carteira Nacional de Habilitação com fotografia – na forma da Lei nº 9.503/97 e o Documento de Identidade Nacional de Estrangeiro (Carteira de Registro Nacional Migratório - CRNM).

1.8.1. A CTPS Digital apenas tem validade como documento para fins de acompanhamento do contrato de trabalho, não sendo válida como documento de identificação.

1.9 Ao se inscrever para este Processo Seletivo, o(a) candidato(a) declara conhecer e aceitar todas as condições descritas neste edital. Declara, ainda, estar ciente de que qualquer omissão ou falsidade, bem como o não atendimento das exigências impostas, culminará com a sua desclassificação do processo.

 

2. DA FORMA DE OFERTA

2.1 Os cursos de licenciatura ofertados neste Edital, na modalidade presencial, tendo ou não parte de sua carga horária ofertada à distância, nos termos da legislação vigente, são oferecidos a quem já tenha concluído o Ensino Médio.

2.2 O início das aulas para os estudantes matriculados se dará em data a ser definida no Calendário Acadêmico e Administrativo de cada campus a ser divulgado na página oficial de cada campus, que pode ser consultada no Anexo IV deste Edital.

 

3. DOS CURSOS E VAGAS

3.1 A distribuição das vagas nos diversos cursos e campi do IFPR e nas diferentes cotas de inclusão e ampla concorrência encontram-se, respectivamente, no Anexo I e no Anexo II deste Edital.

3.2 O total das vagas ofertadas para cada curso e turma será disponibilizado da seguinte forma:

3.2.1 60% (sessenta por cento) do total das vagas ofertadas para cada curso e turma, para cursos de licenciatura, são reservadas aos candidatos que tenham cursado integralmente o Ensino Médio em escolas públicas do Brasil, em cursos regulares ou no âmbito da modalidade de Educação de Jovens e Adultos (EJA), ou tenham obtido certificado de conclusão com base no resultado do Exame Nacional do Ensino Médio, do Exame Nacional para Certificação de Competências da Educação de Jovens e Adultos (Encceja) ou de exames de certificação de competência ou de avaliação de jovens e adultos realizados pelos sistemas estaduais de ensino. Esse percentual será distribuído da seguinte maneira:

3.2.1.1 50% (cinquenta por cento) serão destinados, para cada curso e turma, aos candidatos que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário - mínimo nacional per capita (R$ 1.412,00), havendo reserva de vagas para candidatos:

3.2.1.1.1 BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas.

3.2.1.1.2 BR-EP-Q - Autodeclarados quilombolas.

3.2.1.1.3 BR-EP-PCD - Pessoas com deficiência.

3.2.1.1.4 BR-EP - Demais candidatos.

3.2.1.2 50% (cinquenta por cento) serão destinados, para cada curso e turma, aos candidatos que, independentemente de renda familiar, havendo reserva de vagas para candidatos:

3.2.1.2.1 EP-PPI - Autodeclarados pretos, pardos ou indígenas.

3.2.1.2.2 EP-Q - Autodeclarados quilombolas.

3.2.1.2.3 EP-PCD - Pessoas com deficiência.

3.2.1.2.4 EP - Demais candidatos

3.3.1 IFPR-PPI - 10% (dez por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos autodeclarados pretos, pardos ou indígenas.

3.3.2 IFPR-PCD - 5% (cinco por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos com deficiência.

3.3.3 25% (vinte por cento) do total das vagas ofertadas para cada curso e turma são reservadas à Ampla Concorrência (AC). Nesta forma de oferta estão incluídos estudantes que estudaram qualquer tempo em escolas particulares mesmo sendo bolsistas.

3.4 Os Processos Seletivos do IFPR realizam reserva de vagas através do Sistema de Ações Afirmativas (cotas), estabelecidas nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023 mediante a comprovação das respectivas condições por meio de documentos.

3.4.1 O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, segue o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas ações afirmativas (cotas), bem como a ampla concorrência não atendam exatamente os percentuais indicados.

3.4.2 A base para a distribuição de vagas em cada ação afirmativa (cota) e na Ampla Concorrência encontra-se no Anexo II deste edital.

3.4.1. Candidatos(as) estrangeiros, que não sejam naturalizados, ou que tenham feito parte de seu estudo no exterior, não poderão participar do processo seletivo na reserva de vagas para estudantes de escola pública, devendo, portanto, responder NÃO à pergunta de número 1 (um) do Questionário Socioeconômico no momento da inscrição.

3.5. As ações afirmativas às quais o(a) candidato(a) poderá concorrer durante o processo seletivo serão definidas mediante preenchimento de questionário socioeconômico, durante a realização da inscrição.

3.5.1. O questionário socioeconômico a que se refere o item 3.5 possuirá as seguintes questões:

a) QUESTÃO 01 - Você concluiu TODA a etapa de ensino anterior à modalidade de curso para a qual está se inscrevendo em uma instituição pública?

b) QUESTÃO 02 - De acordo com as condições estabelecidas no edital do processo seletivo, a sua renda per capta familiar é igual ou inferior a 1 salário mínimo atualmente? (Renda familiar per capita é calculada dividindo-se o total de renda familiar pelo número de moradores de uma residência).

c) QUESTÃO 03 - Você se identifica como pessoa preta, parda ou indígena?

d) QUESTÃO 04 - Você é membro ou reside em alguma comunidade remanescente de quilombo?

e) QUESTÃO 05 - Você possui alguma deficiência que se enquadra nas condições estabelecidas no edital do processo seletivo para o qual está se inscrevendo e que pode ser comprovada por meio de laudo médico?

3.6. As vagas da Ampla Concorrência são destinadas a todos(as) os(as) candidatos(as) que se julgarem aptos(as) a participar do certame, independentemente da condição social, racial, de deficiência ou de terem cursado o ensino fundamental em escola pública ou privada.

3.6.1 Os(as) candidatos(as) que já possuam escolaridade de nível superior somente podem concorrer nas vagas de da Ampla Concorrência.

3.7. Quando ocorrer a existência de vagas em uma determinada ação afirmativa (cota) e a falta de candidatos inscritos para ocupá-las, ocorrerá a convocação de candidatos de outras listas de concorrência, a partir da migração da referida vaga, respeitando a ordem constante no Anexo III.

 

4. DO SISTEMA DE AÇÕES AFIRMATIVAS (COTAS)

4.1 Cotas para Escola Pública

4.1.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de escola pública devem apresentar, no momento da matrícula, histórico escolar por meio do qual comprovem ter cursado e concluído todo o Ensino Médio exclusivamente na rede pública de ensino do Brasil.

4.1.2. Não poderá ser matriculado(a), nas vagas reservadas para as ações Afirmativas (cotas) de Escola Pública, o(a) candidato(a) que tenha cursado o Ensino Médio, integralmente ou em parte, em escolas particulares, inclusive com bolsa de estudos parcial ou integral (Art. 5º, Inciso II b, § 1º da Portaria Normativa nº 18 de 2012). Identificadas disciplinas isoladas realizadas na rede privada de ensino, o(a) candidato(a) também estará impossibilitado(a) de se matricular nestas vagas.

4.1.3. De acordo com o Art. 19, inciso I da Lei nº 9.394, de 20 de dezembro de 1996, considera-se Escola Pública a instituição criada ou incorporada, mantida e administrada pelo poder público. As escolas pertencentes ao Sistema S (SENAI, SESI, SENAC), escolas conveniadas, escolas filantrópicas ou, ainda, fundações ou instituições similares (mesmo que mantenham educação gratuita) não são consideradas instituições da rede pública de ensino.

4.1.4 Caso, no momento da matrícula, o documento a que se refere o item 4.1.1 não seja apresentado ou não comprove a condição de o estudante ter realizado todo o Ensino Médio em escola pública, requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

4.1.4.1 Ocorrendo a situação prevista no item 4.1.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo V que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

4.1.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.1.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

 

4.2. Cotas para Baixa Renda

4.2.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de Baixa Renda deverão comprovar renda familiar bruta igual ou inferior a 1(um) salário-mínimo per capita (equivalente a R$ 1.412,00, de acordo com o DECRETO Nº 11.864, DE 27 DE DEZEMBRO DE 2023).

4.2.2. Para atendimento da condição de baixa renda, deve-se considerar:

a) Família: a unidade nuclear composta por uma ou mais pessoas, eventualmente ampliada por outras pessoas que contribuam para o rendimento ou tenham suas despesas atendidas por aquela unidade familiar, todas moradoras em um mesmo domicílio;

b) Morador: a pessoa que tem o domicílio como local habitual de residência e nele reside na data de inscrição do estudante no processo seletivo da instituição federal de ensino;

c) Renda familiar bruta mensal: a soma dos rendimentos brutos auferidos por todas as pessoas da família, calculada na forma do disposto no Art. 7º da Portaria Normativa nº 18/2012 do MEC.

d) Renda familiar bruta mensal per capita: a razão entre a renda familiar bruta mensal e o total de pessoas da família, calculada na forma do art. 7º da Portaria Normativa Nº 18, de 11 de outubro de 2012 - MEC.

4.2.3. No momento da matrícula, os documentos comprobatórios para análise da renda deverão ser referentes aos 3 meses anteriores ao período de inscrições (julho, agosto e setembro de 2024).

4.2.3.1 Os documentos a que se refere o item 4.2.3 constam no Anexo VI e deverão ser enviados, em um único arquivo, através do Portal do Candidato do IFPR no item “Documentos Comprobatórios de Renda”.

4.2.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

4.2.4.1 Ocorrendo a situação prevista no item 4.2.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo V que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

4.2.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.2.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

 

4.3 Cotas para Pretos, Pardos ou Indígenas

4.3.1. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa de Pretos, Pardos ou Indígenas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

4.3.2. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

4.3.2.1. Para os candidatos autodeclarados indígenas, quando convocados para a heteroidentificação, deverão apresentar:

a) cópia digitalizada do RANI (Registro de Nascimento Indígena); e/ou

b) declaração de residência/pertencimento à comunidade indígena assinada por 3 (três) autoridades indígenas, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo VIII; e/ou

c) histórico escolar emitido por escola indígena.

4.3.2.2 As demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

4.3.3. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa preta, parda ou indígena, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas pretas, pardas ou indígenas.

 

4.4 Cotas para Pessoa com Deficiência

4.4.1. Considerar-se-á Pessoa com Deficiência (PcD) aquela que possui impedimento de longo prazo, de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade em igualdade de condições com as demais pessoas, conforme artigo 2º da Lei nº 13.146, de 06 de julho de 2015, e a pessoa com transtorno do espectro autista, de acordo com art. 1º, § 2 o da Lei nº 12.764, de 27 de dezembro de 2012.

4.4.2. Os(As) candidatos(as) inscritos(as) pelo Sistema de Ações Afirmativas (cota) Pessoa com Deficiência deverão se enquadrar:

a) No art. 4º do Decreto nº 3.298, de 20 de dezembro de 1999, atualizado pelo art. 5º, § 1º, inciso I, do Decreto nº 5.296, de 02 de dezembro de 2004, o qual apresenta as seguintes definições:

I - deficiência física: alteração completa ou parcial de um ou mais segmentos do corpo humano, acarretando o comprometimento da função física, apresentando-se sob a forma de paraplegia, paraparesia, monoplegia, monoparesia, tetraplegia, tetraparesia, triplegia, triparesia, hemiplegia, hemiparesia, ostomia, amputação ou ausência de membro, paralisia cerebral, nanismo, membros com deformidade congênita ou adquirida, exceto as deformidades estéticas e as que não produzam dificuldades para o desempenho de funções;

II - deficiência auditiva: perda bilateral, parcial ou total, de quarenta e um decibéis (dB) ou mais, aferida por audiograma nas frequências de 500Hz, 1.000Hz, 2.000Hz e 3.000Hz;

III - deficiência visual: cegueira, na qual a acuidade visual é igual ou menor que 0,05 no melhor olho, com a melhor correção óptica; a baixa visão, que significa acuidade visual entre 0,3 e 0,05 no melhor olho, com a melhor correção óptica; os casos nos quais a somatória da medida do campo visual em ambos os olhos for igual ou menor que 60º; ou a ocorrência simultânea de quaisquer das condições anteriores; visão monocular como deficiência sensorial, do tipo visual (conforme definido na lei nº 14.126 de 22 de março de 2021) .

IV - deficiência intelectual: funcionamento intelectual significativamente inferior à média, com manifestação antes dos dezoito anos e limitações associadas a duas ou mais áreas de habilidades adaptativas, tais como: 1. comunicação; 2. cuidado pessoal; 3. habilidades sociais; 4. utilização dos recursos da comunidade; 5. saúde e segurança; 6. habilidades acadêmicas; 7. lazer; e 8. trabalho;

V - deficiência múltipla - associação de duas ou mais deficiências.

b) No art. 1º, § 1º, incisos I e II, e § 2º, da Lei nº 12.764, de 27 de dezembro de 2012, que apresenta as seguintes definições acerca do Transtorno do Espectro Autista: § 1º Para os efeitos desta Lei, é considerada pessoa com transtorno do espectro autista aquela portadora de síndrome clínica caracterizada na forma dos seguintes incisos I ou II:

I - deficiência persistente e clinicamente significativa da comunicação e da interação sociais,manifestada por deficiência marcada de comunicação verbal e não verbal usada para interação social; ausência de reciprocidade social; falência em desenvolver e manter relações apropriadas ao seu nível de desenvolvimento;

II - padrões restritivos e repetitivos de comportamentos, interesses e atividades, manifestados por comportamentos motores ou verbais estereotipados ou por comportamentos sensoriais incomuns; excessiva aderência a rotinas e padrões de comportamento ritualizados; interesses restritos e fixos. § 2º A pessoa com transtorno do espectro autista é considerada pessoa com deficiência, para todos os efeitos legais.

4.4.3. O(A) candidato(a) aprovado(a) nas vagas reservadas para Pessoas com Deficiência deverá apresentar, no momento da matrícula através do Portal do Candidato do IFPR, laudo médico assinado por médico responsável que ateste alguma das condições descritas no item 4.4.2.

4.4.3.1. O laudo médico deverá:

a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no item 4.4.2;

c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

4.4.3.2. O(A) candidato(a) inscrito(a) nas vagas reservadas para Pessoas com Deficiência autoriza a utilização pelo IFPR do laudo médico entregue no momento da matrícula.

4.4.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

4.4.4.1 Ocorrendo a situação prevista no item 4.4.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo V que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

4.4.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.4.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

4.4.5. Caso seja constatada inexatidão ou irregularidade de informações, ainda que posteriormente ao processo seletivo e/ou à matrícula, o(a) candidato(a) será eliminado(a) do Processo Seletivo, declarando-se nulos todos os atos decorrentes de sua inscrição.

 

4.5 Cotas para Quilombolas

4.5.1. Os(As) candidatos(as) inscritos(as) pela ação afirmativa destinada a quilombolas são aqueles que comprovem residência/pertencimento às comunidades remanescentes de quilombo.

4.5.2. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa para quilombolas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

4.5.3. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

4.5.4. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa quilombola, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas quilombolas.

4.5.5. O(A) candidato(a) autodeclarado Quilombola, quando da convocação para a heteroidentificação, deverá apresentar, obrigatoriamente, os seguintes documentos:

a) Autodeclaração étnico-racial devidamente preenchida e assinada (disponível aqui);

b)Cópia frente e verso de documento de identificação com foto;

c) Declaração de residência/pertencimento às comunidades remanescentes de quilombo assinada por 3 (três) autoridades de Associação Quilombola reconhecida pela Fundação Palmares, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo IX.

4.5.6. As comunidades remanescentes de quilombos são apenas aquelas certificadas pela Fundação Cultural Palmares, nos termos do Decreto 4.887/03, de 20/11/2003.

4.5.7. Demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

4.6. Todos os(as) candidatos(as) optantes pelo Sistema de Ações Afirmativas (cotas) concorrerão, primeiramente, na Ampla Concorrência e, se não classificados, concorrerão em seu respectivo grupo de Ações Afirmativas (cotas), de acordo com a sequência de prioridades abaixo:

a) IFPR-PPI - candidatos autodeclarados pretos, pardos ou indígenas, independentemente de renda familiar e de ter cursado a etapa anterior em escola pública.

b) IFPR-PCD - candidatos com deficiência, independentemente de renda familiar e de ter cursado a etapa anterior integralmente em escola pública.

c) EP - estudantes que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

d) EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

e) EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

f) EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

g) BR-EP - candidatos que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

h) BR-EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

i) BR-EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

j) BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

4.7 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) constarão apenas na lista geral da Ampla Concorrência, não precisando fazer qualquer comprovação quanto às ações afirmativas para as quais foi previamente classificado.

 

Cronograma do Processo Seletivo
O processo seletivo terá início em 20 de setembro de 2024 com a publicação do Edital no site institucional e se estenderá até 12 de março de 2025, com a divulgação do resultado definitivo das matrículas.

Período de Inscrição:

As inscrições serão realizadas online no período de 03 de outubro de 2024 a 17 de janeiro de 2025.

O período para solicitação de isenção da taxa de inscrição será de 03 de outubro a 15 de janeiro de 2025.

A relação nominal com o resultado preliminar dos pedidos de isenção concedidos será divulgada em 17 de janeiro de 2025.

O prazo para interposição de recursos contra a relação nominal com o resultado do pedido de isenções concedidas será até 20 de janeiro de 2025.

A relação nominal com o resultado definitivo do pedido de isenções concedidas será divulgada em 21 de janeiro de 2025.

O prazo final para pagamento da taxa de inscrição é 22 de janeiro de 2025.

Homologação de Inscrições:

A lista preliminar das inscrições homologadas no Processo Seletivo será publicada em 28 de janeiro de 2025.

O prazo para interposição de recurso referente à homologação de inscrições será em 29 de janeiro de 2025.

A análise dos recursos contra o resultado da lista preliminar dos inscritos no Processo Seletivo acontecerá em 30 de janeiro de 2025.

A publicação final das inscrições homologadas será em 31 de janeiro de 2025.

Classificação e Resultados:

A análise das notas do Enem será realizada entre 31 de janeiro e 05 de fevereiro de 2025.

A publicação da classificação preliminar acontecerá em 06 de fevereiro de 2025.

O prazo para interposição de recurso referente à classificação preliminar será em 07 de fevereiro de 2025.

A publicação do resultado dos recursos referentes à classificação preliminar será em 11 de fevereiro de 2025.

Ações Afirmativas/Cotas Sociais:

A convocação dos candidatos inscritos nas vagas das ações afirmativas/cotas sociais para realização do processo de heteroidentificação e entrega de documentos para comprovação da condição de cotista será em 11 de fevereiro de 2025.

As bancas de heteroidentificação e análise pelos comissões dos documentos entregues acontecerão entre 12 de fevereiro e 19 de fevereiro de 2025.

A publicação do resultado preliminar da heteroidentificação e análise documental será em 20 de fevereiro de 2025.

O prazo para interposição de recurso contra o resultado preliminar da heteroidentificação e análise documental será de 21 a 23 de fevereiro de 2025.

A análise dos recursos pela Coordenação de Ações Inclusivas e comissão recursal de heteroidentificação será realizada em 24 de fevereiro de 2025.

A publicação do resultado final do processo de heteroidentificação será em 25 de fevereiro de 2025.

Resultado Final e Matrículas:

A publicação do Resultado Final do Processo Seletivo será em 25 de fevereiro de 2025.

A convocação para matrícula da 1ª chamada será em 26 de fevereiro de 2025.

O período de matrícula para os candidatos convocados na 1ª chamada será de 26 de fevereiro a 07 de março de 2025.

A divulgação do resultado provisório das matrículas será em 10 de março de 2025.

O prazo para recurso contra o resultado provisório das matrículas será em 11 de março de 2025.

A divulgação do resultado definitivo das matrículas será em 12 de março de 2025.


 

6. DAS INSCRIÇÕES

6.1 As inscrições devem ser feitas através do Portal do Candidato do IFPR que pode ser acessado através link: https://portaldocandidato.ifpr.edu.br/.

6.1.1 Para fazer seu login no Portal do Candidato do IFPR, o candidato deverá utilizar sua conta pessoal gov.br.

6.1.2 Caso não possua conta gov.br, o candidato deverá realizar o seu cadastro, conforme tutorial que pode ser acessado a partir do link dos vídeos tutoriais disponível no item 1.1.3.

6.2 A inscrição do(a) candidato(a) implicará ciência e aceitação das normas e condições estabelecidas no inteiro teor deste edital, das quais não poderá alegar desconhecimento.

6.3 No ato da inscrição, o(a) candidato(a) deverá realizar integralmente o procedimento de inscrição, de modo a:

a) responder ao questionário a que se refere o item 3.5.1 deste Edital;

b) conferir e confirmar as ações afirmativas para as quais estará concorrendo;

c) preencher todos os demais dados solicitados;

d) informar a nota obtida em cada uma das provas do Exame Nacional do Ensino Médio - Enem: Ciências da Natureza e suas Tecnologias; Ciências Humanas e suas Tecnologias; Matemática e suas Tecnologias; Linguagens, Códigos e suas Tecnologias; e Redação.

e) realizar o upload do comprovante oficial de notas (Boletim Individual de Desempenho) do Exame Nacional do Ensino Médio - Enem; e

f) confirmar a inscrição.

6.4 O(A) candidato(a) poderá assistir ao vídeo explicativo disponível no link, para ajudar com o procedimento de inscrição.

6.5 As informações fornecidas no formulário de inscrição e o seu correto preenchimento são de responsabilidade do(a) candidato(a), dispondo o IFPR do direito de excluir do processo de ingresso aquele que não preencher a solicitação de inscrição de forma completa e correta, bem como aquele que fornecer dados comprovadamente inverídicos.

 

7. DAS ISENÇÕES DE TAXA DE INSCRIÇÃO

7.1 Todos os estudantes inscritos para cursos de licenciatura estarão automaticamente isentos de qualquer valor referente à inscrição.

 

8. DA CLASSIFICAÇÃO

8.1 A classificação será realizada em ordem decrescente da média geral derivada das notas das provas de Ciências da Natureza e suas Tecnologias; Ciências Humanas e suas Tecnologias; Matemática e suas Tecnologias; Linguagens, Códigos e suas Tecnologias; e Redação do Exame Nacional do Ensino Médio - ENEM informadas pelos candidatos(as).

8.1.1 A média a que se refere o item 8.1 se dará numa escala de 0,00 (zero pontos) a 1000,00 (mil pontos) e será calculada automaticamente pelo Portal do Candidato a partir das notas lançadas pelo(a) candidato(a).

8.1.2 Todos(as) os(as) candidatos(as) constarão na lista de classificação da Ampla Concorrência.

8.1.3 Além da lista da Ampla Concorrência, os(as) candidatos(as) constarão nas listas de todas as ações afirmativas as quais tenham sido enquadrados conforme item 3.5 deste edital.

8.1.4 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) serão classificados(as) apenas na lista geral da Ampla Concorrência.

8.2 No caso de empate, será considerado para o desempate:

a) maior idade

e

b) persistindo o empate, sorteio.

8.3 Anteriormente à publicação da classificação preliminar, a média gerada e as notas informadas serão conferidas com o comprovante oficial de notas submetido no procedimento de inscrição.

8.3.1 Se constatada divergência nas notas lançadas pelo candidato, resultando em média incorreta, esta será relançada pela Equipe de Assessoramento do Processo Seletivo responsável pelo curso em questão, sendo a média do(a) candidato(a) recalculada pelo Portal do Candidato do IFPR.

8.3.1.1 Caso a condição do comprovante oficial de notas (Boletim Individual de Desempenho) do Exame Nacional do Ensino Médio - Enem impossibilite a devida conferência, a nota do(a) candidato(a) será definida como 0 (zero).

 

9. DOS RESULTADOS

9.1. O resultado preliminar do Processo Seletivo será divulgado na data definida pelo cronograma disponível no item 5 deste edital, no Portal do Candidato do IFPR (https://portaldocandidato.ifpr.edu.br/).

9.2. Caberá recurso contra a classificação preliminar. O recurso deverá ser protocolado de forma online através do Portal do Candidato (https://portaldocandidato.ifpr.edu.br/) em datas definidas no cronograma disponível no item 5 deste edital.

9.2.1. A Equipe de Assessoramento do Processo Seletivo 2025 do IFPR avaliará as informações prestadas no formulário de recurso referente à classificação, deferindo ou não o pedido.

9.3. O resultado final será constituído da lista geral de classificação pela ampla concorrência e por cada uma das ações afirmativas (cotas), para cada campus e curso.

9.3.1. A lista geral de classificação em cada uma das ações afirmativas poderá sofrer alterações durante o processo de heteroidentificação e da análise dos documentos de matrícula dos(as) candidatos(as) inscritos(as) nas ações afirmativas de Baixa Renda, PcD e Escola Pública.

9.4. Respeitado o disposto no item 4.6 deste edital, os candidatos aprovados dentro das vagas previstas, serão convocados para matrícula em primeira chamada.

9.4.1 Após as matrículas a que se refere o item 9.4 e que estão descritas no título 10, poderão ocorrer chamadas complementares, caso algum candidato previamente convocado não confirme sua matrícula.

 

10. DAS MATRÍCULAS

10.1. A matrícula será permitida ao(à) candidato(a) que apresentar toda a documentação exigida e tenha concluído o Ensino Médio.

10.2. A matrícula dos candidatos(as) aprovados(as) nas chamadas do Processo Seletivo ocorrerá respeitando as vagas disponíveis, a ordem de classificação estabelecida conforme resultado.

10.3. As matrículas dos(as) candidatos(as) aprovados(as) deverão ser realizadas exclusivamente de forma online, através do Portal do Candidato do IFPR (https://portaldocandidato.ifpr.edu.br/).

10.3.1. O(A) candidato(a) deverá acessar o Portal do Candidato e realizar o upload dos documentos solicitados conforme o período definido no cronograma.

10.4. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação do edital e as chamadas de candidatos(as) aprovados(as).

10.5. O(A) candidato(a) que não realizar sua matrícula, conforme datas e definições do edital, perderá o direito à vaga, possibilitando que o(a) próximo(a) candidato(a) da lista de classificação seja convocado(a).

10.5.1 Ocorrendo a situação prevista no item 10.5, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo V que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

10.6. Os documentos para matrícula, comuns a todos(as) os(as) candidatos(as), são:

10.6.1 Carteira de identidade;

10.6.1.1 Se candidato(a) estrangeiro(a), em substituição ao documento previsto no item 10.6.1, deve ser apresentado: documento de identidade nacional de estrangeiro (Carteira de Registro Nacional Migratório - CRNM) ou Residência Mercosul, emitida por autoridade brasileira, válida à data da matrícula;

10.6.2 Certidão de nascimento ou Certidão de Casamento;

10.6.3 Certificado de Alistamento Militar, de Dispensa de Incorporação ou de Reservista, no caso dos candidatos do sexo masculino maiores de 18 anos e com idade até 45 anos;

10.6.4 Declaração de vacinação (para candidatos com menos de 18 (dezoito) anos) emitida e assinada por profissional de saúde, atestando que o adolescente está com o seu esquema vacinal de acordo com a recomendação estabelecida no Programa Nacional de Imunização – PNI, do Ministério da Saúde e da Secretaria de Estado da Saúde;

10.6.5. Uma via impressa da certidão de quitação eleitoral (para candidatos com mais de 18 (dezoito) anos que já possuem titulo eleitoral), que poderá ser obtida em qualquer Cartório Eleitoral e também na página eletrônica www.tse.jus.br.

10.6.6 Certificado de conclusão do Ensino Médio ou equivalente que comprove a conclusão do Ensino Médio;

10.6.6.1 Poderá ser apresentada Declaração de Conclusão do Ensino Médio, desde que, num prazo de 60 (sessenta) dias, o histórico seja apresentado à Secretaria Acadêmica do campus;

10.6.6.2 O candidato que realizou seus estudos em instituições estrangeiras, além da documentação e procedimentos definidos neste Edital, também deve entregar Comprovante de Conclusão de Ensino Médio, revalidado no Brasil na forma da lei.
10.6.6.2.1 É dispensada a revalidação se o comprovante de conclusão de estudos pertencer a um país integrante do Mercosul.

10.6.7 Formulário de Requerimento de Matrícula devidamente preenchido pelo responsável legal em caso de candidatos menores de 18 anos (conforme Anexo VII); e

10.6.8 Documento de Identificação do Responsável Legal para menores de 18 anos.

10.7. Os documentos necessários para comprovação das Ações Afirmativas (cotas) de Baixa Renda, Pessoa com Deficiência e Escola Pública são:

10.7.1 AÇÃO AFIRMATIVA DE ESCOLA PÚBLICA: Os candidatos deverão apresentar, no momento da matrícula, Histórico Escolar por meio do qual comprovem ter cursado e concluído todo o ensino médio (do primeiro ao terceiro anos, ou equivalente) exclusivamente na rede pública de ensino do Brasil.

10.7.2 AÇÃO AFIRMATIVA DE PESSOA COM DEFICIÊNCIA: Laudo médico atestando a espécie e o grau da deficiência. O laudo deverá:

a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no edital do processo seletivo;

c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

10.7.3 AÇÃO AFIRMATIVA DE BAIXA RENDA: documentos especificados no Anexo VI deste Edital.

10.8 O estudante que ingressar mediante processo seletivo tendo efetuado seu registro acadêmico, deverá realizar a confirmação de sua matrícula devendo possuir frequência a pelo menos uma das aulas previstas para os 5 (cinco) primeiros dias letivos do calendário acadêmico do campus.

10.8.1 A não realização da confirmação de matrícula pelo estudante ou de pessoa por ele autorizada para tal, caracterizar-se-á como desistência, o que ocasionará o cancelamento do seu registro acadêmico.

 

11. DAS DISPOSIÇÕES FINAIS

11.1. A Comissão Central do Processo Seletivo, a Equipe de Assessoramento do Processo Seletivo e o IFPR não se responsabilizam por solicitação de inscrição via internet não efetivada por motivos de ordem técnica, falhas de comunicação, congestionamento de linhas de comunicação ou quaisquer outros fatores de ordem técnica que impossibilitem a transferência dos dados ou a impressão de documentos.

11.2. A inscrição do(a) candidato(a) implicará a aceitação total e incondicional das normas e instruções constantes neste edital.

11.3. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação dos resultados das etapas do Processo Seletivo, que serão realizadas através do endereço eletrônico https://portaldocandidato.ifpr.edu.br/.

11.4. A inexatidão ou irregularidade de informações, ainda que constatada posteriormente ao processo seletivo e/ou à matrícula, eliminará o(a) candidato(a) do Processo de Seleção, declarando-se nulos todos os atos decorrentes de sua inscrição.

11.5 Após esgotadas as chamadas complementares previstas no item 9.4.1 e persistindo a existência de vagas não ocupadas, novo processo seletivo será realizado com regramento a ser publicado em edital próprio.

11.6 Os candidatos que não têm acesso a equipamento e/ou internet poderão dirigir-se a um dos campi do IFPR (de acordo com os endereços indicados no Anexo V), de segunda-feira a sexta-feira, no horário de funcionamento do campus, no período destinado às inscrições.

11.7. Os casos omissos e as situações não previstas no presente edital serão analisados pela Comissão Central do Processo Seletivo e pela Equipe de Assessoramento do Processo Seletivo.

 

Curitiba, 20 de setembro de 2024.

 

 

 

Assinado:
logotipo	 

Documento assinado eletronicamente por ADRIANO WILLIAN DA SILVA VIANA PEREIRA, Reitor, em 20/09/2024, às 21:20, conforme horário oficial de Brasília, com fundamento no art. 6º, caput, do Decreto nº 8.539, de 8 de outubro de 2015.
QRCode Assinatura	 

A autenticidade deste documento pode ser conferida no site https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&id_orgao_acesso_externo=0, informando o código verificador 3185080 e o código CRC AA4C2607.

ANEXO I - EDITAL IFPR Nº 89, DE 20 DE setembro DE 2024
Oferta de Cursos de Licenciatura
CAMPUS | CURSO | TURNO | VAGAS | DURAÇÃO
------- | -------- | -------- | -------- | --------
Astorga | Pedagogia | Noturno | 40 | 4 anos
Campo Largo | Matemática | Noturno | 40 | 4 anos
Capanemã | Matemática | Noturno | 40 | 4 anos
Cascavel | Química | Noturno | 40 | 4 anos
Colombo | História | Noturno | 40 | 4 anos
Colombo | Pedagogia | Noturno | 40 | 4 anos
Curitiba | Pedagogia | Vespertino | 40 | 4 anos
Foz do Iguaçu | Física | Noturno | 40 | 4,5 anos
Irati | Química | Noturno | 40 | 4 anos
Ivaíporã | Física | Noturno | 36 | 4,5 anos
Jacarezinho | Química | Noturno | 40 | 4 anos
Londrina | Ciências Biológicas | Noturno | 40 | 4 anos
Palmas | Educação Física | Noturno + 1 tarde (até o 4º período) / Noturno (Licenciatura) + Vespertino (Bacharelado) (a partir do 5º período) | 50 | 4 anos
Palmas | Química | Noturno + 1 tarde | 40 | 4 anos
Palmas | Artes Visuais | Noturno | 40 | 4 anos
Palmas | Ciências Biológicas | Noturno + 1 tarde | 40 | 4 anos
Palmas | Letras - Português/Inglês | Noturno | 40 | 4 anos
Palmas | Pedagogia | Noturno + 1 tarde | 40 | 4 anos
Paranaguá | Ciências Sociais | Noturno | 40 | 4 anos
Paranaguá | Física | Noturno | 40 | 4 anos
Paranavaí | Química | Noturno | 40 | 4 anos
Pitanga | Pedagogia | Noturno | 40 | 4 anos
Pitanga | Química | Noturno | 40 | 4 anos
Telêmaco Borba | Física | Noturno | 40 | 4 anos
Umuarama | Ciências Biológicas | Noturno | 40 | 4 anos
Umuarama | Química | Noturno | 40 | 4 anos



¹ As Graduações em Química e em Educação Física do Campus Palmas possuem formação em Bacharelado e Licenciatura. A Graduação em Química destina 20 vagas para bacharelado e 20 vagas para licenciatura. A escolha ocorre a partir do 5º semestre do curso. Na Graduação em Educação Física, havendo disponibilidade de vagas, o estudante poderá optar no 5º semestre entre o bacharelado, a licenciatura, ou ambas as formações. Os critérios completos para a destinação de vagas estabelecidos nos Projetos Pedagógicos de Curso, que podem ser acessados nos links https://ifpr.edu.br/palmas/about/nossos-cursos/about-nossos-cursos-cursos-de-graduacao-regulamentos/educacao-fisica/ppc-educacao-fisica/ e https://ifpr.edu.br/palmas/about/nossos-cursos/about-nossos-cursos-cursos-de-graduacao-regulamentos/quimica-9/ppc-quimica/

² Os cursos cujos turnos estão assinalados como sendo “Noturno + 1 tarde” aparecerão no Portal do Candidato do IFPR como turno “Noturno”, sem prejuízo à informação deste quadro de vagas e a consequente necessidade de o estudante cumpri-la.


 


`;
            var edital90 = `Edital N°90, de 20 de setembro de 2024

PROCESSO SELETIVO IFPR 2025 - CURSOS SUPERIORES DE BACHARELADO E TECNOLOGIA

 

O Reitor do Instituto Federal de Educação, Ciência e Tecnologia do Paraná, no uso da competência que lhe confere o Decreto de 06 de fevereiro de 2024, publicado no Diário Oficial da União no dia 07 de fevereiro de 2024, seção 2, página 01, torna público as normas que regem o Processo Seletivo IFPR 2025 para ingresso nos Cursos Superiores de bacharelado e tecnologia, na modalidade presencial, ofertados para o ano de 2025, considerando a política de inclusão do IFPR para o ingresso de estudantes nos cursos. As inscrições, cuja taxa é de R$50,00 (cinquenta reais), estarão abertas de 03 de outubro de 2024 a 17 de janeiro de 2025.

 

BASE LEGAL

Lei nº 9.394, de 20 de dezembro de 1996 - Estabelece as diretrizes e bases da educação nacional.

Decreto nº 3.298, de 20 de dezembro de 1999 - Regulamenta a Lei no 7.853, de 24 de outubro de 1989, dispõe sobre a Política Nacional para a Integração da Pessoa Portadora de Deficiência, consolida as normas de proteção, e dá outras providências.

Decreto nº 5.296, de 02 de dezembro de 2004 - Regulamenta as Leis nos 10.048, de 8 de novembro de 2000, que dá prioridade de atendimento às pessoas que especifica, e 10.098, de 19 de dezembro de 2000, que estabelece normas gerais e critérios básicos para a promoção da acessibilidade das pessoas portadoras de deficiência ou com mobilidade reduzida, e dá outras providências.

Decreto nº 6.593/2008 - Regulamenta o art. 11 da Lei no 8.112, de 11 de dezembro de 1990, quanto à isenção de pagamento de taxa de inscrição em concursos públicos realizados no âmbito do Poder Executivo federal.

Lei nº 12.711, de 29 de agosto de 2012 - Dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio e dá outras providências.

Lei nº 12.764, de 27 de dezembro de 2012 - Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista; e altera o § 3º do art. 98 da Lei nº 8.112, de 11 de dezembro de 1990.

Decreto nº 7.824, de 11 de outubro de 2012 - Regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

Lei nº 13.146, de 06 de julho de 2015 - Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).

Lei nº 13.409, de 28 de dezembro de 2016 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre a reserva de vagas para pessoas com deficiência nos cursos técnico de nível médio e superior das instituições federais de ensino.

Decreto nº 9.034, de 20 de abril de 2017 - Altera o Decreto n º 7.824, de 11 de outubro de 2012, que regulamenta a Lei n º 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

Lei nº 14.126 de 22 de março de 2021 - Classifica a visão monocular como deficiência sensorial, do tipo visual.

Decreto nº 11.016/2022 - Regulamenta o Cadastro Único para Programas Sociais do Governo Federal, instituído pelo art. 6º-F da Lei nº 8.742, de 7 de dezembro de 1993.

Lei nº 14.723 de 13 de novembro de 2023 - Altera a Lei nº 12.711, de 29 de agosto de 2012, para dispor sobre o programa especial para o acesso às instituições federais de educação superior e de ensino técnico de nível médio de estudantes pretos, pardos, indígenas e quilombolas e de pessoas com deficiência, bem como daqueles que tenham cursado integralmente o ensino médio ou fundamental em escola pública.

Decreto nº 11.781 de 14 de novembro de 2023 - Altera o Decreto nº 7.824, de 11 de outubro de 2012, que regulamenta a Lei nº 12.711, de 29 de agosto de 2012, que dispõe sobre o ingresso nas universidades federais e nas instituições federais de ensino técnico de nível médio.

Decreto Nº 11.864, de 27 de dezembro de 2023 - Dispõe sobre o valor do salário mínimo a vigorar a partir de 1º de janeiro de 2024.

Portaria Normativa MEC nº 18, de 11 de outubro de 2012 - Dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei no 12.711, de 29 de agosto de 2012, e o Decreto no 7.824, de 11 de outubro de 2012.

Portaria Normativa nº 2.027 de 16 de novembro de 2023 - Altera a Portaria Normativa MEC nº 18, de 11 de outubro de 2012, que dispõe sobre a implementação das reservas de vagas em instituições federais de ensino de que tratam a Lei nº 12.711, de 29 de agosto de 2012, e a Portaria Normativa MEC nº 21, de 5 de novembro de 2012, que dispõe sobre o Sistema de Seleção Unificada - Sisu.

Resolução Consup/IFPR nº 190/2024 – Dispõe sobre a Organização Didático-Pedagógica dos Cursos Técnicos de Nível Médio na modalidade presencial do Instituto Federal de Educação, Ciência e Tecnologia do Paraná.

Resolução Consup/IFPR nº 55/2011 – Dispõe sobre a Organização Didático Pedagógica da Educação Superior no âmbito do Instituto Federal do Paraná – IFPR.

 

1. DAS DISPOSIÇÕES PRELIMINARES

1.1. Os cursos de bacharelado e tecnologia, objeto deste certame, são públicos, gratuitos e presenciais, devendo o(a) candidato(a) ter disponibilidade de tempo para realizar atividades no contraturno e/ou aos sábados, conforme o calendário acadêmico do campus e o projeto pedagógico do curso.

1.1.1 Alguns cursos podem possuir parte de sua carga horária à distância, conforme a legislação vigente e o seu projeto pedagógico de curso.

1.1.2 Para acessar tutoriais em vídeo sobre o processo seletivo (com acessibilidade), utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/tutoriais/.

1.1.3 Para acessar formulários e outros documentos editáveis, utilize o endereço eletrônico https://ifpr.edu.br/estude-conosco/processo-seletivo-2025/documentos/.

1.1.4 Para acessar o Portal do Candidato do IFPR, utilize o endereço eletrônico https://portaldocandidato.ifpr.edu.br/.

1.2. Ao término do curso, o estudante fará jus ao diploma de bacharel ou tecnólogo na respectiva área de conhecimento.

1.3. Para ingresso nos Cursos de Bacharelado e Tecnologia o candidato deverá ter concluído, imprescindivelmente, o Ensino Médio até a data da matrícula.

1.4. O processo seletivo será realizado em uma única etapa, que consistirá na classificação do(a) candidato(a) pelo seu desempenho (notas) obtidas no Exame Nacional de Ensino Médio (ENEM) dos últimos dez anos (entre 2015 e 2024), conforme detalhado no item 6, deste Edital.

1.5 É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação de todos os atos, editais e comunicados referentes ao Processo Seletivo regido por este edital.

1.6 O(A) candidato(a) que se inscrever pelo Sistema de Ações Afirmativas (cotas) automaticamente autoriza a divulgação dos resultados do Processo Seletivo referente a este edital de acordo com a classificação gerada pelo Sistema de Ações Afirmativas (cotas), nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023.

1.7 O(A) candidato(a) deverá possuir Carteira de Identidade (CI) e CPF para participar do referido processo seletivo.

1.8 Serão considerados documentos de identificação: Carteira de Identidade expedida pelas Secretarias de Segurança Pública, pelas Forças Armadas Brasileiras, por países que possuem acordos diplomáticos com o Brasil, Polícias Militares, Ordens ou Conselhos que, por Lei Federal, tenha validade como documento de identidade e possibilite a conferência da foto e da assinatura; Carteira de Identidade Nacional - CIN; Carteira de Trabalho e Previdência Social(CTPS); Passaporte; ou Carteira Nacional de Habilitação com fotografia – na forma da Lei nº 9.503/97 e o Documento de Identidade Nacional de Estrangeiro (Carteira de Registro Nacional Migratório - CRNM).

1.8.1. A CTPS Digital apenas tem validade como documento para fins de acompanhamento do contrato de trabalho, não sendo válida como documento de identificação.

1.9 Ao se inscrever para este Processo Seletivo, o(a) candidato(a) declara conhecer e aceitar todas as condições descritas neste edital. Declara, ainda, estar ciente de que qualquer omissão ou falsidade, bem como o não atendimento das exigências impostas, culminará com a sua desclassificação do processo.

 

2. DA FORMA DE OFERTA

2.1 Os cursos de bacharelado e tecnologia ofertados neste Edital, na modalidade presencial, tendo ou não parte de sua carga horária ofertada à distância, nos termos da legislação vigente, são oferecidos a quem já tenha concluído o Ensino Médio.

2.1.1 O IFPR oferta, no campus Palmas, as graduações em Educação Física e Química que contemplam formação em bacharelado e licenciatura. A seleção das turmas de ingresso para o ano de 2025, bem como os critérios para a escolha posterior da formação em bacharelado ou licenciatura, constarão no edital específico para os cursos superiores de licenciatura.

2.2 O início das aulas para os estudantes matriculados se dará em data a ser definida no Calendário Acadêmico e Administrativo de cada campus a ser divulgado na página oficial de cada campus, que pode ser consultada no Anexo IV deste Edital.

 

3. DOS CURSOS E VAGAS

3.1 A distribuição das vagas nos diversos cursos e campi do IFPR e nas diferentes cotas de inclusão e ampla concorrência encontram-se, respectivamente, no Anexo I e no Anexo II deste Edital.

3.2 O total das vagas ofertadas para cada curso e turma será disponibilizado da seguinte forma:

3.2.1 60% (sessenta por cento) do total das vagas ofertadas para cada curso e turma, para cursos de bacharelado e tecnologia, são reservadas aos candidatos que tenham cursado integralmente o Ensino Médio em escolas públicas do Brasil, em cursos regulares ou no âmbito da modalidade de Educação de Jovens e Adultos (EJA), ou tenham obtido certificado de conclusão com base no resultado do Exame Nacional do Ensino Médio, do Exame Nacional para Certificação de Competências da Educação de Jovens e Adultos (Encceja) ou de exames de certificação de competência ou de avaliação de jovens e adultos realizados pelos sistemas estaduais de ensino. Esse percentual será distribuído da seguinte maneira:

3.2.1.1 50% (cinquenta por cento) serão destinados, para cada curso e turma, aos candidatos que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário - mínimo nacional per capita (R$ 1.412,00), havendo reserva de vagas para candidatos:

3.2.1.1.1 BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas.

3.2.1.1.2 BR-EP-Q - Autodeclarados quilombolas.

3.2.1.1.3 BR-EP-PCD - Pessoas com deficiência.

3.2.1.1.4 BR-EP - Demais candidatos.

3.2.1.2 50% (cinquenta por cento) serão destinados, para cada curso e turma, aos candidatos que, independentemente de renda familiar, havendo reserva de vagas para candidatos:

3.2.1.2.1 EP-PPI - Autodeclarados pretos, pardos ou indígenas.

3.2.1.2.2 EP-Q - Autodeclarados quilombolas.

3.2.1.2.3 EP-PCD - Pessoas com deficiência.

3.2.1.2.4 EP - Demais candidatos

3.3.1 IFPR-PPI - 10% (dez por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos autodeclarados pretos, pardos ou indígenas.

3.3.2 IFPR-PCD - 5% (cinco por cento) do total das vagas ofertadas para cada curso e turma são reservadas aos candidatos com deficiência.

3.3.3 25% (vinte por cento) do total das vagas ofertadas para cada curso e turma são reservadas à Ampla Concorrência (AC). Nesta forma de oferta estão incluídos estudantes que estudaram qualquer tempo em escolas particulares mesmo sendo bolsistas.

3.4 Os Processos Seletivos do IFPR realizam reserva de vagas através do Sistema de Ações Afirmativas (cotas), estabelecidas nos termos da Lei nº 12.711, de 29 de agosto de 2012, do Decreto nº 7.824, de 11 de outubro de 2012, da Portaria Normativa MEC nº 18, de 11 de outubro de 2012, da Lei nº 13.409, de 28 de dezembro de 2016, do Decreto nº 9.034, de 20 de abril de 2017, da Lei nº 14.723 de 13 de novembro de 2023, do Decreto nº 11.781 de 14 de novembro de 2023 e da Portaria Normativa nº 2.027 de 16 de novembro de 2023 mediante a comprovação das respectivas condições por meio de documentos.

3.4.1 O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, segue o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas ações afirmativas (cotas), bem como a ampla concorrência não atendam exatamente os percentuais indicados.

3.4.2 A base para a distribuição de vagas em cada ação afirmativa (cota) e na Ampla Concorrência encontra-se no Anexo II deste edital.

3.4.1. Candidatos(as) estrangeiros, que não sejam naturalizados, ou que tenham feito parte de seu estudo no exterior, não poderão participar do processo seletivo na reserva de vagas para estudantes de escola pública, devendo, portanto, responder NÃO à pergunta de número 1 (um) do Questionário Socioeconômico no momento da inscrição.

3.5. As ações afirmativas às quais o(a) candidato(a) poderá concorrer durante o processo seletivo serão definidas mediante preenchimento de questionário socioeconômico, durante a realização da inscrição.

3.5.1. O questionário socioeconômico a que se refere o item 3.5 possuirá as seguintes questões:

a) QUESTÃO 01 - Você concluiu TODA a etapa de ensino anterior à modalidade de curso para a qual está se inscrevendo em uma instituição pública?

b) QUESTÃO 02 - De acordo com as condições estabelecidas no edital do processo seletivo, a sua renda per capta familiar é igual ou inferior a 1 salário mínimo atualmente? (Renda familiar per capita é calculada dividindo-se o total de renda familiar pelo número de moradores de uma residência).

c) QUESTÃO 03 - Você se identifica como pessoa preta, parda ou indígena?

d) QUESTÃO 04 - Você é membro ou reside em alguma comunidade remanescente de quilombo?

e) QUESTÃO 05 - Você possui alguma deficiência que se enquadra nas condições estabelecidas no edital do processo seletivo para o qual está se inscrevendo e que pode ser comprovada por meio de laudo médico?

3.6. As vagas da Ampla Concorrência são destinadas a todos(as) os(as) candidatos(as) que se julgarem aptos(as) a participar do certame, independentemente da condição social, racial, de deficiência ou de terem cursado o ensino fundamental em escola pública ou privada.

3.6.1 Os(as) candidatos(as) que já possuam escolaridade de nível superior somente podem concorrer nas vagas de da Ampla Concorrência.

3.7. Quando ocorrer a existência de vagas em uma determinada ação afirmativa (cota) e a falta de candidatos inscritos para ocupá-las, ocorrerá a convocação de candidatos de outras listas de concorrência, a partir da migração da referida vaga, respeitando a ordem constante no Anexo III.

 

4. DO SISTEMA DE AÇÕES AFIRMATIVAS (COTAS)

4.1 Cotas para Escola Pública

4.1.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de escola pública devem apresentar, no momento da matrícula, histórico escolar por meio do qual comprovem ter cursado e concluído todo o Ensino Médio exclusivamente na rede pública de ensino do Brasil.

4.1.2. Não poderá ser matriculado(a), nas vagas reservadas para as ações Afirmativas (cotas) de Escola Pública, o(a) candidato(a) que tenha cursado o Ensino Médio, integralmente ou em parte, em escolas particulares, inclusive com bolsa de estudos parcial ou integral (Art. 5º, Inciso II b, § 1º da Portaria Normativa nº 18 de 2012). Identificadas disciplinas isoladas realizadas na rede privada de ensino, o(a) candidato(a) também estará impossibilitado(a) de se matricular nestas vagas.

4.1.3. De acordo com o Art. 19, inciso I da Lei nº 9.394, de 20 de dezembro de 1996, considera-se Escola Pública a instituição criada ou incorporada, mantida e administrada pelo poder público. As escolas pertencentes ao Sistema S (SENAI, SESI, SENAC), escolas conveniadas, escolas filantrópicas ou, ainda, fundações ou instituições similares (mesmo que mantenham educação gratuita) não são consideradas instituições da rede pública de ensino.

4.1.4 Caso, no momento da matrícula, o documento a que se refere o item 4.1.1 não seja apresentado ou não comprove a condição de o estudante ter realizado todo o Ensino Médio em escola pública, requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

4.1.4.1 Ocorrendo a situação prevista no item 4.1.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VI que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

4.1.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.1.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.


4.2. Cotas para Baixa Renda

4.2.1. Os(As) candidatos(as) inscritos(as) por alguma ação afirmativa de Baixa Renda deverão comprovar renda familiar bruta igual ou inferior a 1(um) salário-mínimo per capita (equivalente a R$ 1.412,00, de acordo com o DECRETO Nº 11.864, DE 27 DE DEZEMBRO DE 2023).

4.2.2. Para atendimento da condição de baixa renda, deve-se considerar:

a) Família: a unidade nuclear composta por uma ou mais pessoas, eventualmente ampliada por outras pessoas que contribuam para o rendimento ou tenham suas despesas atendidas por aquela unidade familiar, todas moradoras em um mesmo domicílio;

b) Morador: a pessoa que tem o domicílio como local habitual de residência e nele reside na data de inscrição do estudante no processo seletivo da instituição federal de ensino;

c) Renda familiar bruta mensal: a soma dos rendimentos brutos auferidos por todas as pessoas da família, calculada na forma do disposto no Art. 7º da Portaria Normativa nº 18/2012 do MEC.

d) Renda familiar bruta mensal per capita: a razão entre a renda familiar bruta mensal e o total de pessoas da família, calculada na forma do art. 7º da Portaria Normativa Nº 18, de 11 de outubro de 2012 - MEC.

4.2.3. No momento da matrícula, os documentos comprobatórios para análise da renda deverão ser referentes aos 3 meses anteriores ao período de inscrições (julho, agosto e setembro de 2024).

4.2.3.1 Os documentos a que se refere o item 4.2.3 constam no Anexo VII e deverão ser enviados, em um único arquivo, através do Portal do Candidato do IFPR no item “Documentos Comprobatórios de Renda”.

4.2.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

4.2.4.1 Ocorrendo a situação prevista no item 4.2.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VI que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

4.2.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.2.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

 

4.3 Cotas para Pretos, Pardos ou Indígenas

4.3.1. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa de Pretos, Pardos ou Indígenas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

4.3.2. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

4.3.2.1. Para os candidatos autodeclarados indígenas, quando convocados para a heteroidentificação, deverão apresentar:

a) cópia digitalizada do RANI (Registro de Nascimento Indígena); e/ou

b) declaração de residência/pertencimento à comunidade indígena assinada por 3 (três) autoridades indígenas, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo IX; e/ou

c) histórico escolar emitido por escola indígena.

4.3.2.2 As demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

4.3.3. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa preta, parda ou indígena, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas pretas, pardas ou indígenas.

 

4.4 Cotas para Pessoa com Deficiência

4.4.1. Considerar-se-á Pessoa com Deficiência (PcD) aquela que possui impedimento de longo prazo, de natureza física, mental, intelectual ou sensorial, o qual, em interação com uma ou mais barreiras, pode obstruir sua participação plena e efetiva na sociedade em igualdade de condições com as demais pessoas, conforme artigo 2º da Lei nº 13.146, de 06 de julho de 2015, e a pessoa com transtorno do espectro autista, de acordo com art. 1º, § 2 o da Lei nº 12.764, de 27 de dezembro de 2012.

4.4.2. Os(As) candidatos(as) inscritos(as) pelo Sistema de Ações Afirmativas (cota) Pessoa com Deficiência deverão se enquadrar:

a) No art. 4º do Decreto nº 3.298, de 20 de dezembro de 1999, atualizado pelo art. 5º, § 1º, inciso I, do Decreto nº 5.296, de 02 de dezembro de 2004, o qual apresenta as seguintes definições:

I - deficiência física: alteração completa ou parcial de um ou mais segmentos do corpo humano, acarretando o comprometimento da função física, apresentando-se sob a forma de paraplegia, paraparesia, monoplegia, monoparesia, tetraplegia, tetraparesia, triplegia, triparesia, hemiplegia, hemiparesia, ostomia, amputação ou ausência de membro, paralisia cerebral, nanismo, membros com deformidade congênita ou adquirida, exceto as deformidades estéticas e as que não produzam dificuldades para o desempenho de funções;

II - deficiência auditiva: perda bilateral, parcial ou total, de quarenta e um decibéis (dB) ou mais, aferida por audiograma nas frequências de 500Hz, 1.000Hz, 2.000Hz e 3.000Hz;

III - deficiência visual: cegueira, na qual a acuidade visual é igual ou menor que 0,05 no melhor olho, com a melhor correção óptica; a baixa visão, que significa acuidade visual entre 0,3 e 0,05 no melhor olho, com a melhor correção óptica; os casos nos quais a somatória da medida do campo visual em ambos os olhos for igual ou menor que 60º; ou a ocorrência simultânea de quaisquer das condições anteriores; visão monocular como deficiência sensorial, do tipo visual (conforme definido na lei nº 14.126 de 22 de março de 2021) .

IV - deficiência intelectual: funcionamento intelectual significativamente inferior à média, com manifestação antes dos dezoito anos e limitações associadas a duas ou mais áreas de habilidades adaptativas, tais como: 1. comunicação; 2. cuidado pessoal; 3. habilidades sociais; 4. utilização dos recursos da comunidade; 5. saúde e segurança; 6. habilidades acadêmicas; 7. lazer; e 8. trabalho;

V - deficiência múltipla - associação de duas ou mais deficiências.

b) No art. 1º, § 1º, incisos I e II, e § 2º, da Lei nº 12.764, de 27 de dezembro de 2012, que apresenta as seguintes definições acerca do Transtorno do Espectro Autista: § 1º Para os efeitos desta Lei, é considerada pessoa com transtorno do espectro autista aquela portadora de síndrome clínica caracterizada na forma dos seguintes incisos I ou II:

I - deficiência persistente e clinicamente significativa da comunicação e da interação sociais,manifestada por deficiência marcada de comunicação verbal e não verbal usada para interação social; ausência de reciprocidade social; falência em desenvolver e manter relações apropriadas ao seu nível de desenvolvimento;

II - padrões restritivos e repetitivos de comportamentos, interesses e atividades, manifestados por comportamentos motores ou verbais estereotipados ou por comportamentos sensoriais incomuns; excessiva aderência a rotinas e padrões de comportamento ritualizados; interesses restritos e fixos. § 2º A pessoa com transtorno do espectro autista é considerada pessoa com deficiência, para todos os efeitos legais.

4.4.3. O(A) candidato(a) aprovado(a) nas vagas reservadas para Pessoas com Deficiência deverá apresentar, no momento da matrícula através do Portal do Candidato do IFPR, laudo médico assinado por médico responsável que ateste alguma das condições descritas no item 4.4.2.

4.4.3.1. O laudo médico deverá:

a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no item 4.4.2;

c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

4.4.3.2. O(A) candidato(a) inscrito(a) nas vagas reservadas para Pessoas com Deficiência autoriza a utilização pelo IFPR do laudo médico entregue no momento da matrícula.

4.4.4. Caso, no momento da matrícula, os documentos a que se refere o item 4.2.3 não sejam apresentados ou não comprovem a condição de renda requerida na ação afirmativa, o(a) candidato(a) não terá sua matrícula efetuada, perdendo o direito à vaga naquela ação afirmativa em que foi chamado.

4.4.4.1 Ocorrendo a situação prevista no item 4.4.4, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VI que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

4.4.4.2 Caso ocorra a manutenção do indeferimento da matrícula descrita no item 4.4.4 o candidato permanecerá na lista de espera da Ampla Concorrência e das outras ações afirmativas (cotas) que tenha sido originalmente classificado, podendo ser convocado em chamadas complementares.

4.4.5. Caso seja constatada inexatidão ou irregularidade de informações, ainda que posteriormente ao processo seletivo e/ou à matrícula, o(a) candidato(a) será eliminado(a) do Processo Seletivo, declarando-se nulos todos os atos decorrentes de sua inscrição.

 

4.5 Cotas para Quilombolas

4.5.1. Os(As) candidatos(as) inscritos(as) pela ação afirmativa destinada a quilombolas são aqueles que comprovem residência/pertencimento às comunidades remanescentes de quilombo.

4.5.2. Os(As) candidatos(as) inscritos(as) e preliminarmente aprovados em alguma ação afirmativa para quilombolas serão convocados(as), obrigatoriamente, a passar pelo procedimento de heteroidentificação, por meio de edital próprio.

4.5.3. O procedimento de heteroidentificação será realizado anteriormente à fase de matrícula.

4.5.4. Caso, após o procedimento de heteroidentificação, seja indeferida a autodeclaração como pessoa quilombola, o(a) candidato(a) somente poderá ser convocado em qualquer das chamadas, pela Ampla Concorrência e ou por outras ações afirmativas (cotas) que não sejam direcionadas a pessoas quilombolas.

4.5.5. O(A) candidato(a) autodeclarado Quilombola, quando da convocação para a heteroidentificação, deverá apresentar, obrigatoriamente, os seguintes documentos:

a) Autodeclaração étnico-racial devidamente preenchida e assinada (disponível aqui);

b) Cópia frente e verso de documento de identificação com foto;

c) Declaração de residência/pertencimento às comunidades remanescentes de quilombo assinada por 3 (três) autoridades de Associação Quilombola reconhecida pela Fundação Palmares, com os respectivos contatos telefônicos das 3 (três) autoridades conforme Anexo X.

4.5.6. As comunidades remanescentes de quilombos são apenas aquelas certificadas pela Fundação Cultural Palmares, nos termos do Decreto 4.887/03, de 20/11/2003.

4.5.7. Demais orientações para a realização do procedimento de heteroidentificação estarão descritas em edital específico a ser publicado conforme cronograma do item 5.

4.6. Todos os(as) candidatos(as) optantes pelo Sistema de Ações Afirmativas (cotas) concorrerão, primeiramente, na Ampla Concorrência e, se não classificados, concorrerão em seu respectivo grupo de Ações Afirmativas (cotas), de acordo com a sequência de prioridades abaixo:

a) IFPR-PPI - candidatos autodeclarados pretos, pardos ou indígenas, independentemente de renda familiar e de ter cursado a etapa anterior em escola pública.

b) IFPR-PCD - candidatos com deficiência, independentemente de renda familiar e de ter cursado a etapa anterior integralmente em escola pública.

c) EP - estudantes que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

d) EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

e) EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

f) EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública, independentemente de renda familiar.

g) BR-EP - candidatos que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

h) BR-EP-PCD - Pessoas com deficiência que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

i) BR-EP-Q - Autodeclarados quilombolas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

j) BR-EP-PPI - Autodeclarados pretos, pardos ou indígenas que cursaram a etapa anterior integralmente em escola pública e que tenham renda familiar bruta mensal igual ou inferior a 1 (um) salário- mínimo nacional per capita (R$ 1.412,00).

4.7 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) constarão apenas na lista geral da Ampla Concorrência, não precisando fazer qualquer comprovação quanto às ações afirmativas para as quais foi previamente classificado.

 

Cronograma do Processo Seletivo

O cronograma do Processo Seletivo está organizado em etapas, com datas específicas para cada atividade.

Início: 20/09/2024

Publicação do Edital: A publicação do Edital ocorrerá no dia 20 de setembro de 2024 no site institucional.

Inscrições: O período de inscrição online será de 03 de outubro de 2024 a 17 de janeiro de 2025.

Isenção de Taxa: Candidatos que desejarem solicitar isenção da taxa de inscrição podem fazê-lo entre 03 de outubro de 2024 e 15 de janeiro de 2025.

Resultado da Isenção: A relação nominal com o resultado preliminar do pedido de isenções concedidas será divulgada em 17 de janeiro de 2025.

Recurso da Isenção: O prazo para interposição de recursos contra a relação nominal com o resultado do pedido de isenções concedidas será de 20 de janeiro de 2025.

Resultado Final da Isenção: A relação nominal com o resultado definitivo do pedido de isenções concedidas será divulgada em 21 de janeiro de 2025.

Pagamento da Taxa: O prazo final para pagamento da taxa de inscrição é 22 de janeiro de 2025.

Homologação das Inscrições:

A lista preliminar das inscrições homologadas no Processo Seletivo será publicada em 28 de janeiro de 2025.

O prazo para interposição de recurso referente à homologação de inscrições é 29 de janeiro de 2025.

A análise dos recursos contra o resultado da lista preliminar dos inscritos no Processo Seletivo será realizada em 30 de janeiro de 2025.

A publicação final das inscrições homologadas ocorrerá em 31 de janeiro de 2025.

Análise do Enem: A análise das notas do Enem será realizada entre 31 de janeiro e 05 de fevereiro de 2025.

Classificação Preliminar: A publicação da classificação preliminar será no dia 06 de fevereiro de 2025.

Recurso da Classificação: O prazo para interposição de recurso referente à classificação preliminar é 07 de fevereiro de 2025.

Resultado do Recurso da Classificação: A publicação do resultado dos recursos referentes à classificação preliminar será em 11 de fevereiro de 2025.

Heteroidentificação e Documentação:

A convocação dos candidatos inscritos nas vagas das ações afirmativas/cotas sociais para realização do processo de heteroidentificação e entrega de documentos para comprovação da condição de cotista ocorrerá em 11 de fevereiro de 2025.

As bancas de heteroidentificação e análise pelas comissões dos documentos entregues serão realizadas de 12 a 19 de fevereiro de 2025.

Resultado da Heteroidentificação:

A publicação do resultado preliminar da heteroidentificação e análise documental será em 20 de fevereiro de 2025.

O prazo para interposição de recurso contra o resultado preliminar da heteroidentificação e análise documental é de 21 a 23 de fevereiro de 2025.

A análise dos recursos pela Coordenação de Ações Inclusivas e comissão recursal de heteroidentificação será realizada em 24 de fevereiro de 2025.

A publicação do resultado final do processo de heteroidentificação ocorrerá em 25 de fevereiro de 2025.

Resultado Final do Processo Seletivo: A publicação do Resultado Final do Processo Seletivo será em 25 de fevereiro de 2025.

Matrícula:

A convocação para matrícula da 1ª chamada será em 26 de fevereiro de 2025.

O período de matrícula para os candidatos convocados na 1ª chamada será de 26 de fevereiro a 07 de março de 2025.

A divulgação do resultado provisório das matrículas ocorrerá em 10 de março de 2025.

O prazo para recurso contra o resultado provisório das matrículas é 11 de março de 2025.

A divulgação do resultado definitivo das matrículas será em 12 de março de 2025.

Fim do Processo Seletivo: 12/03/2025

 

6. DAS INSCRIÇÕES

6.1 As inscrições devem ser feitas através do Portal do Candidato do IFPR que pode ser acessado através link https://portaldocandidato.ifpr.edu.br/.

6.1.1 Para fazer seu login no Portal do Candidato do IFPR, o candidato deverá utilizar sua conta pessoal gov.br.

6.1.2 Caso não possua conta gov.br, o candidato deverá realizar o seu cadastro, conforme tutorial que pode ser acessado a partir do link dos vídeos tutoriais disponível no item 1.1.3.

6.2 A inscrição do(a) candidato(a) implicará ciência e aceitação das normas e condições estabelecidas no inteiro teor deste edital, das quais não poderá alegar desconhecimento.

6.3 No ato da inscrição, o(a) candidato(a) deverá realizar integralmente o procedimento de inscrição, de modo a:

a) responder ao questionário a que se refere o item 3.5.1 deste Edital;

b) conferir e confirmar as ações afirmativas para as quais estará concorrendo;

c) preencher todos os demais dados solicitados;

d) informar a nota obtida em cada uma das provas do Exame Nacional do Ensino Médio - Enem: Ciências da Natureza e suas Tecnologias; Ciências Humanas e suas Tecnologias; Matemática e suas Tecnologias; Linguagens, Códigos e suas Tecnologias; e Redação.

e) realizar o upload do comprovante oficial de notas (Boletim Individual de Desempenho) do Exame Nacional do Ensino Médio - Enem; e

f) confirmar a inscrição.

6.4 O(A) candidato(a) poderá assistir ao vídeo explicativo disponível no link, para ajudar com o procedimento de inscrição.

6.5 As informações fornecidas no formulário de inscrição e o seu correto preenchimento são de responsabilidade do(a) candidato(a), dispondo o IFPR do direito de excluir do processo de ingresso aquele que não preencher a solicitação de inscrição de forma completa e correta, bem como aquele que fornecer dados comprovadamente inverídicos.

6.6 Após o preenchimento dos formulários o candidato deverá realizar o pagamento da taxa no valor de R$50,00 (cinquenta reais) ou solicitar a isenção de inscrição.

6.6.1 Para realizar o pagamento da taxa de inscrição, o candidato deverá gerar, no Portal do Candidato do IFPR, um boleto de pagamento em nome da FUNTEF-PR - Fundação de Apoio à UTFPR.

6.6.2 Caso o candidato solicite isenção do valor da inscrição, deverá seguir as instruções constantes no item 7 do Edital.

6.6.2.1 Em caso de indeferimento no pedido de isenção, o candidato deverá pagar a taxa de inscrição, conforme dispõe os itens 6.6 e 6.6.1, respeitados os prazos constantes no cronograma deste edital.

 

7. DAS ISENÇÕES DE TAXA DE INSCRIÇÃO

7.1 A solicitação de isenção da taxa de inscrição se dará conforme o disposto no Decreto nº 6.593/2008.

7.2. São requisitos para o(a) candidato(a) solicitar a isenção de pagamento da taxa de inscrição:

a) estar inscrito(a) no Cadastro Único para Programas Sociais do Governo Federal (CadÚnico);

b) conforme disposto no Decreto nº 11.016/2022, ter perfil de família com renda mensal per capita (por pessoa) de até meio salário mínimo (R$ 706,00).

7.3. Para solicitar a isenção da taxa de inscrição, o(a) candidato(a) deverá realizar os seguintes procedimentos:

a) realizar sua inscrição no Portal do Candidato, conforme descrito no item 6.1;

b) preencher e assinar o formulário de requerimento de isenção, disponível no Anexo V. Em caso de candidato menor de 18 anos completos, o formulário deverá ser assinado pelo(a) responsável do(a) candidato(a);

c) providenciar os documentos comprobatórios solicitados no Anexo V;

d) digitalizar a carteira de identificação (CI) com foto do(a) candidato(a);

e) enviar o formulário, a digitalização da carteira de identificação e os demais documentos comprobatórios no local indicado no Portal do Candidato.

7.3.1. Serão aceitos os documentos enviados até a data limite para solicitar a isenção, definida no cronograma do item 5 deste edital.

7.3.2. Candidatos(as) oriundos(as) da mesma família deverão preencher o formulário de requerimento de forma individual.

7.3.3. Não será permitido o envio de quaisquer itens/documentos por correio postal ou e-mail que não seja o formulário online disponível no Portal do Candidato.

7.4. Terá o seu requerimento de isenção da taxa de inscrição indeferido o(a) candidato(a) que:

a) não apresentar, de forma completa, a documentação exigida no item 7.3;

b) preencher de forma incorreta o formulário de requerimento (Anexo V).

7.5. A análise das solicitações será executada pela Equipe de Assessoramento do Processo Seletivo 2025 do IFPR, que irá avaliar as informações prestadas no formulário de requerimento e demais documentos anexados.

7.5.1. O resultado das solicitações será publicado conforme data definida no cronograma do item 5 deste edital.

7.6 Caso o candidato tenha entregado os documentos corretos, mas por algum motivo seu pedido tenha sido indeferido ele poderá fazer recurso através do formulário (Anexo VIII) e enviá-lo através do e-mail recursos@ifpr.edu.br.

7.6.1. O recurso será avaliado pela Equipe de Assessoramento do Processo Seletivo 2025 do IFPR.

7.7. A concessão de isenção da taxa de inscrição é pessoal e intransferível.

7.8. Em caso de indeferimento no pedido de isenção, o candidato deverá pagar a taxa de inscrição, conforme dispõe os itens 6.6 e 6.6.1, respeitados os prazos constantes no cronograma deste edital.

 

8. DA CLASSIFICAÇÃO

8.1 A classificação será realizada em ordem decrescente da média geral derivada das notas das provas de Ciências da Natureza e suas Tecnologias; Ciências Humanas e suas Tecnologias; Matemática e suas Tecnologias; Linguagens, Códigos e suas Tecnologias; e Redação do Exame Nacional do Ensino Médio - ENEM informadas pelos candidatos(as).

8.1.1 A média a que se refere o item 8.1 se dará numa escala de 0,00 (zero pontos) a 1000,00 (mil pontos) e será calculada automaticamente pelo Portal do Candidato a partir das notas lançadas pelo(a) candidato(a).

8.1.2 Todos(as) os(as) candidatos(as) constarão na lista de classificação da Ampla Concorrência.

8.1.3 Além da lista da Ampla Concorrência, os(as) candidatos(as) constarão nas listas de todas as ações afirmativas as quais tenham sido enquadrados conforme item 3.5 deste edital.

8.1.4 Caso o curso em questão possua número de candidatos(as) igual ou inferior ao número de vagas, todos os(as) candidatos(as) serão classificados(as) apenas na lista geral da Ampla Concorrência.

8.2 No caso de empate, será considerado para o desempate:

a) maior idade; e

b) persistindo o empate, sorteio.

8.3 Anteriormente à publicação da classificação preliminar, a média gerada e as notas informadas serão conferidas com o comprovante oficial de notas submetido no procedimento de inscrição.

8.3.1 Se constatada divergência nas notas lançadas pelo candidato, resultando em média incorreta, esta será relançada pela Equipe de Assessoramento do Processo Seletivo responsável pelo curso em questão, sendo a média do(a) candidato(a) recalculada pelo Portal do Candidato do IFPR.

8.3.1.1 Caso a condição do comprovante oficial de notas (Boletim Individual de Desempenho) do Exame Nacional do Ensino Médio - Enem impossibilite a devida conferência, a nota do(a) candidato(a) será definida como 0 (zero).

 

9. DOS RESULTADOS

9.1. O resultado preliminar do Processo Seletivo será divulgado na data definida pelo cronograma disponível no item 5 deste edital, no Portal do Candidato do IFPR (https://portaldocandidato.ifpr.edu.br/).

9.2. Caberá recurso contra a classificação preliminar. O recurso deverá ser protocolado de forma online através do Portal do Candidato (https://portaldocandidato.ifpr.edu.br/) em datas definidas no cronograma disponível no item 5 deste edital.

9.2.1. A Equipe de Assessoramento do Processo Seletivo 2025 do IFPR avaliará as informações prestadas no formulário de recurso referente à classificação, deferindo ou não o pedido.

9.3. O resultado final será constituído da lista geral de classificação pela ampla concorrência e por cada uma das ações afirmativas (cotas), para cada campus e curso.

9.3.1. A lista geral de classificação em cada uma das ações afirmativas poderá sofrer alterações durante o processo de heteroidentificação e da análise dos documentos de matrícula dos(as) candidatos(as) inscritos(as) nas ações afirmativas de Baixa Renda, PcD e Escola Pública.

9.4. Respeitado o disposto no item 4.6 deste edital, os candidatos aprovados dentro das vagas previstas, serão convocados para matrícula em primeira chamada.

9.4.1 Após as matrículas a que se refere o item 9.4 e que estão descritas no título 10, poderão ocorrer chamadas complementares, caso algum candidato previamente convocado não confirme sua matrícula.

 

10. DAS MATRÍCULAS

10.1. A matrícula será permitida ao(à) candidato(a) que apresentar toda a documentação exigida e tenha concluído o Ensino Médio.

10.2. A matrícula dos candidatos(as) aprovados(as) nas chamadas do Processo Seletivo ocorrerá respeitando as vagas disponíveis, a ordem de classificação estabelecida conforme resultado.

10.3. As matrículas dos(as) candidatos(as) aprovados(as) deverão ser realizadas exclusivamente de forma online, através do Portal do Candidato do IFPR, https://portaldocandidato.ifpr.edu.br/.

10.3.1. O(A) candidato(a) deverá acessar o Portal do Candidato e realizar o upload dos documentos solicitados conforme o período definido no cronograma

10.4. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação do edital e as chamadas de candidatos(as) aprovados(as).

10.5. O(A) candidato(a) que não realizar sua matrícula, conforme datas e definições do edital, perderá o direito à vaga, possibilitando que o(a) próximo(a) candidato(a) da lista de classificação seja convocado(a).

10.5.1 Ocorrendo a situação prevista no item 10.5.1, o estudante poderá submeter recurso contra o indeferimento da matrícula, conforme cronograma do Item 5 deste edital, através do formulário constante no Anexo VI que deverá ser preenchido e enviado ao e-mail recursos@ifpr.edu.br.

10.6. Os documentos para matrícula, comuns a todos(as) os(as) candidatos(as), são:

10.6.1 Carteira de identidade;

10.6.1.1 Se candidato(a) estrangeiro(a), em substituição ao documento previsto no item 10.6.1, deve ser apresentado: documento de identidade nacional de estrangeiro (Carteira de Registro Nacional Migratório - CRNM) ou Residência Mercosul, emitida por autoridade brasileira, válida à data da matrícula;

10.6.2 Certidão de nascimento ou Certidão de Casamento;

10.6.3 Certificado de Alistamento Militar, de Dispensa de Incorporação ou de Reservista, no caso dos candidatos do sexo masculino maiores de 18 anos e com idade até 45 anos;

10.6.4 Declaração de vacinação (para candidatos com menos de 18 (dezoito) anos) emitida e assinada por profissional de saúde, atestando que o adolescente está com o seu esquema vacinal de acordo com a recomendação estabelecida no Programa Nacional de Imunização – PNI, do Ministério da Saúde e da Secretaria de Estado da Saúde;

10.6.5. Uma via impressa da certidão de quitação eleitoral (para candidatos com mais de 18 (dezoito) anos que já possuem titulo eleitoral), que poderá ser obtida em qualquer Cartório Eleitoral e também na página eletrônica www.tse.jus.br.

10.6.6 Certificado de conclusão do Ensino Médio ou equivalente que comprove a conclusão do Ensino Médio;

10.6.6.1 Poderá ser apresentada Declaração de Conclusão do Ensino Médio, desde que, num prazo de 60 (sessenta) dias, o histórico seja apresentado à Secretaria Acadêmica do campus;

10.6.6.2 O candidato que realizou seus estudos em instituições estrangeiras, além da documentação e procedimentos definidos neste Edital, também deve entregar Comprovante de Conclusão de Ensino Médio, revalidado no Brasil na forma da lei.
10.6.6.2.1 É dispensada a revalidação se o comprovante de conclusão de estudos pertencer a um país integrante do Mercosul.

10.6.7 Formulário de Requerimento de Matrícula devidamente preenchido pelo responsável legal em caso de candidatos menores de 18 anos (conforme Anexo VIII); e

10.6.8 Documento de Identificação do Responsável Legal para menores de 18 anos.

10.7. Os documentos necessários para comprovação das Ações Afirmativas (cotas) de Baixa Renda, Pessoa com Deficiência e Escola Pública são:

10.7.1 AÇÃO AFIRMATIVA DE ESCOLA PÚBLICA: Os candidatos deverão apresentar, no momento da matrícula, Histórico Escolar por meio do qual comprovem ter cursado e concluído todo o ensino médio (do primeiro ao terceiro anos, ou equivalente) exclusivamente na rede pública de ensino do Brasil.

10.7.2 AÇÃO AFIRMATIVA DE PESSOA COM DEFICIÊNCIA: Laudo médico atestando a espécie e o grau da deficiência. O laudo deverá:

a) Conter a classificação Internacional de Doenças e Problemas Relacionados à Saúde (CID);

b) Relatar a deficiência do candidato, que deverá se enquadrar em uma das categorias mencionadas no edital do processo seletivo;

c) Ser emitido em papel timbrado e conter carimbo com o CRM e assinatura do médico.

10.7.3 AÇÃO AFIRMATIVA DE BAIXA RENDA: documentos especificados no Anexo VII deste Edital.

10.8 O estudante que ingressar mediante processo seletivo tendo efetuado seu registro acadêmico, deverá realizar a confirmação de sua matrícula devendo possuir frequência a pelo menos uma das aulas previstas para os 5 (cinco) primeiros dias letivos do calendário acadêmico do campus.

10.8.1 A não realização da confirmação de matrícula pelo estudante ou de pessoa por ele autorizada para tal, caracterizar-se-á como desistência, o que ocasionará o cancelamento do seu registro acadêmico.

 

11. DAS DISPOSIÇÕES FINAIS

11.1. A Comissão Central do Processo Seletivo, a Equipe de Assessoramento do Processo Seletivo e o IFPR não se responsabilizam por solicitação de inscrição via internet não efetivada por motivos de ordem técnica, falhas de comunicação, congestionamento de linhas de comunicação ou quaisquer outros fatores de ordem técnica que impossibilitem a transferência dos dados ou a impressão de documentos.

11.2. A inscrição do(a) candidato(a) implicará a aceitação total e incondicional das normas e instruções constantes neste edital.

11.3. É de inteira responsabilidade do(a) candidato(a) acompanhar a publicação dos resultados das etapas do Processo Seletivo, que serão realizadas através do endereço eletrônico https://portaldocandidato.ifpr.edu.br/.

11.4. A inexatidão ou irregularidade de informações, ainda que constatada posteriormente ao processo seletivo e/ou à matrícula, eliminará o(a) candidato(a) do Processo de Seleção, declarando-se nulos todos os atos decorrentes de sua inscrição.

11.5 Após esgotadas as chamadas complementares previstas no item 9.4.1 e persistindo a existência de vagas não ocupadas, novo processo seletivo será realizado com regramento a ser publicado em edital próprio.

11.6 Os candidatos que não têm acesso a equipamento e/ou internet poderão dirigir-se a um dos campi do IFPR (de acordo com os endereços indicados no Anexo V), de segunda-feira a sexta-feira, no horário de funcionamento do campus, no período destinado às inscrições.

11.7. Os casos omissos e as situações não previstas no presente edital serão analisados pela Comissão Central do Processo Seletivo e pela Equipe de Assessoramento do Processo Seletivo.

Curitiba, 20 de setembro de 2024.

 

 

 

Assinado:
logotipo	 

Documento assinado eletronicamente por ADRIANO WILLIAN DA SILVA VIANA PEREIRA, Reitor, em 20/09/2024, às 21:20, conforme horário oficial de Brasília, com fundamento no art. 6º, caput, do Decreto nº 8.539, de 8 de outubro de 2015.
QRCode Assinatura	 

A autenticidade deste documento pode ser conferida no site https://sei.ifpr.edu.br/sei/controlador_externo.php?acao=documento_conferir&id_orgao_acesso_externo=0, informando o código verificador 3185087 e o código CRC E00D4E0C.

 

ANEXO I - EDITAL Nº 90, DE 20 DE setembro DE 2024

Oferta de Cursos de Bacharelado e Tecnologia
CAMPUS | CURSO | NÍVEL | TURNO | VAGAS | DURAÇÃO
------- | -------- | -------- | -------- | -------- | --------
Assis Chateaubriand | Gestão Comercial | Tecnologia | Noturno | 40 | 2 anos
Barracão | Tecnologia em Gestão Ambiental | Tecnologia | Noturno | 40 | 3 anos
Campo Largo | Processos Gerenciais | Tecnologia | Noturno | 40 | 2,5 anos
Campo Largo | Materiais | Tecnologia | Noturno | 40 | 3 anos
Campo Largo | Engenharia Elétrica | Bacharelado | Noturno | 40 | 5 anos
Campo Largo | Agroecologia | Tecnologia | Matutino | 40 | 3 anos
Cascavel | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos
Cascavel | Tecnologia em Gestão Ambiental | Tecnologia | Noturno | 40 | 2 anos
Colombo | Alimentos | Tecnologia | Noturno | 40 | 3 anos
Colombo | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos
Colombo | Processos Gerenciais | Tecnologia | Noturno | 40 | 2,5 anos
Coronel Vivida | Gestão Financeira | Tecnologia | Noturno | 40 | 2,5 anos
Curitiba | Gestão Pública | Tecnologia | Noturno | 40 | 2,5 anos
Curitiba | Massoterapia | Tecnologia | Matutino | 35 | 3 anos
Curitiba | Processos Gerenciais | Tecnologia | Noturno | 40 | 2 anos
Curitiba | Processos Escolares | Tecnologia | Vespertino | 40 | 3 anos
Curitiba | Secretariado | Tecnologia | Noturno | 40 | 2 anos
Curitiba | Ciências Contábeis | Bacharelado | Noturno | 40 | 4 anos
Foz do Iguaçu | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos
Foz do Iguaçu | Engenharia de Aquicultura | Bacharelado | Noturno | 36 | 5 anos
Foz do Iguaçu | Gastronomia | Tecnologia | Matutino | 40 | 2 anos
Irati | Agronomia | Bacharelado | Vespertino | 40 | 5 anos
Irati | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos
Ivaíporã | Engenharia Agronômica | Bacharelado | Integral | 40 | 5 anos
Ivaíporã | Sistemas de Informação | Bacharelado | Noturno | 40 | 4 anos
Jacarezinho | Engenharia de Controle e Automação | Bacharelado | Noturno | 40 | 5 anos
Jacarezinho | Sistemas para a Internet | Tecnologia | Noturno | 40 | 3 anos
Jaguariaíva | Gestão de Qualidade | Tecnologia | Noturno | 40 | 3 anos
Londrina | Análise e Desenvolvimento de Sistemas | Tecnologia | Matutino | 40 | 3 anos
Palmas | Administração | Bacharelado | Noturno | 40 | 4 anos
Palmas | Agronomia | Bacharelado | Matutino e Vespertino | 40 | 5 anos
Palmas | Ciências Contábeis | Bacharelado | Noturno | 40 | 4 anos
Palmas | Direito | Bacharelado | Noturno | 40 | 5 anos
Palmas | Enfermagem | Bacharelado | Matutino e Vespertino | 30 | 5 anos
Palmas | Farmácia | Bacharelado | Matutino e Vespertino | 40 | 5 anos
Palmas | Sistemas de Informação | Bacharelado | Noturno | 40 | 4 anos
Paranaguá | Análise e Desenvolvimento de Sistemas | Tecnologia | Matutino | 40 | 3 anos
Paranaguá | Gestão Ambiental | Tecnologia | Matutino | 40 | 2,5 anos
Paranavaí | Engenharia Elétrica | Bacharelado | Noturno | 40 | 5 anos
Paranavaí | Engenharia de Software | Bacharelado | Integral | 40 | 4 anos
Pinhais | Administração | Bacharelado | Noturno | 40 | 4 anos
Pinhais | Ciência da Computação | Bacharelado | Vespertino e Noturno | 35 | 4 anos
Pinhais | Gestão da Tecnologia da Informação | Tecnologia | Noturno | 40 | 3 anos
Pitanga | Agroindústria | Tecnologia | Noturno | 40 | 3 anos
Telêmaco Borba | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos
Telêmaco Borba | Automação Industrial | Tecnologia | Noturno | 40 | 3 anos
Telêmaco Borba | Engenharia Elétrica | Bacharelado | Integral | 40 | 5 anos
Telêmaco Borba | Manutenção Industrial | Tecnologia | Noturno | 40 | 3 anos
Umuarama | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos
Umuarama | Arquitetura e Urbanismo | Bacharelado | Vespertino e Noturno | 40 | 5 anos
Umuarama | Gestão do Agronegócio | Tecnologia | Noturno | 40 | 3 anos
União da Vitória | Agronomia | Bacharelado | Matutino e Vespertino | 40 | 5 anos
União da Vitória | Análise e Desenvolvimento de Sistemas | Tecnologia | Noturno | 40 | 3 anos

As informações acima podem estar sujeitas a alterações. Para informações mais detalhadas, consulte o site da instituição.


¹Haverá aulas no período vespertino quando a carga horária semanal exceder 20 horas.

² Os cursos cujos turnos estão assinalados como sendo “Matutino e Vespertino” e “Vespertino e Noturno” aparecerão no Portal do Candidato do IFPR como turno “Integral”, sem prejuízo à informação deste quadro de vagas e a consequente necessidade de o estudante cumpri-la.

 

ANEXO II - EDITAL Nº 90, DE 20 DE setembro DE 2024

DISTRIBUIÇÃO DAS VAGAS POR FAIXAS DE AÇÃO AFIRMATIVA

 
 

Estudantes que tenham cursado a etapa anterior integralmente em Escola Pública (60% das vagas)
 

Ações afirmativas - IFPR (15% das vagas)
 

Ampla Concorrência (25% das vagas)

 
 

Estudantes que possuam renda bruta familiar per capita igual ou inferior a 1 salário mínimo (30% das vagas)
 

Estudantes que possuam renda bruta familiar per capita superior a 1 salário mínimo (30% das vagas)


OBSERVAÇÃO: O cálculo para a distribuição de vagas, seus possíveis arredondamentos e redistribuições, seguem o disposto na Portaria MEC nº 2027 de 16 de novembro de 2023, o que pode fazer com que algumas cotas não atendam os percentuais indicados no título.


 
ANEXO VII - EDITAL Nº 90, DE 20 DE setembro DE 2024

COMPROVAÇÃO DOCUMENTAL DA RENDA BRUTA MENSAL PARA AVALIAÇÃO DE COTAS BAIXA RENDA

 

Os/as candidatos/as aprovados/as nas ações afirmativas de escola pública e baixa renda (BR-EP; BR-EP-PCD; BR-EP-Q; BR-EP-PPI) deverão comprovar renda familiar bruta mensal per capita (por pessoa) igual ou inferior a 1 (um) salário-mínimo nacional - (R$ 1.412,00). 

Para essa comprovação, você poderá proceder de 2 formas distintas:

a) Apresentar comprovante de inscrição do CadÚnico (Programa de Cadastro único do Governo Federal) que deverá estar atualizado nos últimos 24 (vinte e quatro) meses anteriores à data de inscrição no Processo Seletivo.

 

OU como alternativa aos que não possuem inscrição no CadÚnico:

b) Enviar os comprovantes exigidos em edital para todos os membros da família:

 

1: Preencher e assinar a Declaração de Núcleo Familiar Renda Bruta Familiar disponível no link indicado no item 1.1.3 deste edital.

 

2: ANEXAR DOCUMENTAÇÃO COMUM A TODOS OS MEMBROS DO NÚCLEO FAMILIAR E AO CANDIDATO:

a) Certidão de Nascimento ou Cédula de Identidade (RG) ou Passaporte ou Carteira Nacional de Habilitação, de todos os integrantes do núcleo familiar;

b) CPF de todos os integrantes do núcleo familiar, com mais de 18 anos;

c) Comprovante de residência;

d) Carteira de Trabalho e Previdência Social (CTPS) física, para todos os integrantes com mais de 18 anos, a qual deverá conter as páginas da: foto, qualificação civil, contratos de trabalho e a próxima página em branco de contrato de trabalho. Ou, Carteira de Trabalho Digital em PDF Único atualizada, contendo todos os dados pessoais e contratos de trabalho. Caso não possua CTPS, preencher e assinar Declaração De Não Possuir Carteira De Trabalho E Previdência Social (CTPS) disponível no link indicado no item 1.1.3 deste edital.

e) Declaração de Imposto de Renda completa COM recibo (Exercício 2024, ano calendário 2023), aos componentes do núcleo familiar com mais de 18 anos, caso seja declarante. Aos componentes do núcleo familiar, com mais de 18 anos não declarantes de Imposto de Renda, apresentar comprovante, disponível no link abaixo para consulta: Disponível em: <https://www.restituicao.receita.fazenda.gov.br>

 

3: DOCUMENTAÇÃO DE RENDA PARA TODOS OS INTEGRANTES DO NÚCLEO FAMILIAR COM MAIS DE 18 ANOS: (Caso o núcleo familiar seja composto por integrantes de diferentes categorias (assalariados, autônomos etc.), a documentação deverá ser apresentada em acordo com cada realidade de trabalho e renda).

3.1. DESEMPREGADOS, ESTUDANTES OU DONA(O) DE CASA:

a) Em caso de desemprego recente, apresentar Rescisão de Contrato e comprovante de recebimento do seguro desemprego, e/ou;

b) Preencher e assinar a Declaração – Não Possui Renda Mensal disponível no link indicado no item 1.1.3 deste edital.

 

3.2. TRABALHADORES ASSALARIADOS (celetistas, servidores públicos, empregado doméstico, aprendizes):

a) Contracheques/holerites dos três meses anteriores à inscrição (julho, agosto e setembro de 2024).

 

3.3. APOSENTADOS, PENSIONISTAS E DEMAIS BENEFICIÁRIOS DO INSS:

a) Comprovante do benefício do INSS (aposentado, pensionista ou demais beneficiários), demonstrando o valor bruto recebido dos três últimos meses anteriores à inscrição (julho, agosto e setembro de 2024); OU

b) Comprovante de aposentadoria (caso não seja INSS).

 

3.4. AUTÔNOMOS E PROFISSIONAIS LIBERAIS:

a) Extratos bancários dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e;

b) Preencher e assinar declaração da atividade desenvolvida como autônomo ou liberal e a renda bruta mensal (Declaração Renda variável) disponível no link indicado no item 1.1.3 deste edital.

c) Guias de recolhimento ao INSS com comprovante de pagamento dos três meses anteriores à inscrição.

 

3.5. EMPRESÁRIO OU PESSOAS COM PARTICIPAÇÃO EM COTAS DE EMPRESAS OU MICROEMPRESAS:

a) Extratos bancários dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e;

b) Preencher e assinar declaração da atividade desenvolvida e a renda como empresário/microempreendedor (Declaração Renda variável) disponível no link indicado no item 1.1.3 deste edital.

c) Pró-labores dos três últimos meses anteriores à inscrição (julho, agosto e setembro de 2024), e;

d) Declaração completa de Imposto de Renda de Pessoa Jurídica – DIPJ, exercício 2024 ano calendário 2023, acompanhado do recibo de entrega, quando houver;

e) Declaração completa de Informações socioeconômicas e Fiscais (DEFIS- Simples Nacional) para Microempresários e Empresários de Pequeno Porte, quando houver;

f) Declaração Comprobatória de Percepção de Rendimentos (DECORE), quando houver,

 

3.6. MICROEMPREENDEDOR INDIVIDUAL:

a) Extratos bancários dos dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e

b) Preencher e assinar declaração relatando a atividade desenvolvida como microempreendedor e a renda mensal (Declaração Renda variável), disponível no link indicado no item 1.1.3 deste edital; e

c) Declaração Anual CNPJ MEI (DASN-SIMEI).

 

3.7. TRABALHADORES DO MERCADO INFORMAL: (atividade sem vínculo empregatício, não possui contrato de trabalho, não contribui com INSS).

a) Preencher e assinar declaração relatando a renda bruta mensal e a atividade desenvolvida como trabalhador informal (Declaração Renda variável), disponível no link indicado no item 1.1.3 deste edital.

 

3.8. ESTAGIÁRIOS ou BOLSISTAS:

a) Contrato de estágio/bolsa, ou Termo de Compromisso de estágio/bolsa.

 

3.9. RENDIMENTOS DE ALUGUEL OU ARRENDAMENTO DE BENS MÓVEIS E IMÓVEIS:

a) Extratos bancários dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e

b) Contrato(s) de locação ou arrendamento(s) devidamente registrado(s) em cartório, acompanhado(s) dos recibos dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), ou;

c) Preencher e assinar declaração de próprio punho relatando o valor recebido, acompanhada dos recibos dos três últimos meses anteriores à inscrição (julho, agosto e setembro de 2024).

 

3.10. PARA CASOS DE RECEBIMENTO DE PENSÃO ALIMENTÍCIA:

a) Decisão judicial discriminando o nome do(s) beneficiários e o valor a ser pago, ou;

b) Preencher e assinar declaração do beneficiário e o valor mensal recebido de pensão, (Declaração Renda variável), disponível no link indicado no item 1.1.3 deste edital.

 

3.11. ATIVIDADE RURAL:

a) Extratos bancários dos dos três meses anteriores à inscrição (julho, agosto e setembro de 2024), e

b) Declaração do sindicato rural, associação, cooperativa ou prefeitura, contendo o valor recebido mensalmente ou anualmente e informações detalhadas atividade desenvolvida, ou

c) Preencher e assinar declaração, contendo o valor recebido mensalmente ou anualmente, e informações da atividade desenvolvida, anexando as 3 (três últimas) notas fiscais de vendas de produtos, (Declaração Renda variável), disponível no link indicado no item 1.1.3 deste edital; e

d) Declaração de Imposto de Renda Pessoa Jurídica - IRPJ, quando houver;

e) Quaisquer declarações tributárias referentes a pessoas jurídicas vinculadas ao candidato ou a membros da família, quando for o caso.

 

`;

            let TodosOsEditais = edital87 + edital88 + edital89 + edital90 ; // + edital3 ;
			TodosOsEditais = edital6_2025;

           	try {
   			 if (history.length === 0) {
				history.push({
					role: 'user',
					parts: [{ text: instrucoesIniciais }],
				})
				history.push({
					role: 'user',
					parts: [{ text: TodosOsEditais }],
				})
				}

				const chatSession = model.startChat({
				generationConfig,
				history,
				})

				loading.value = true

				const result = await chatSession.sendMessage(userInput.value)
				const response = await result.response
				const aiResponse = await response.text()

				// Adiciona a mensagem do usuário
				history.push({
				role: 'user',
				parts: [{ text: userInput.value }],
				})
				messages.value.push({
				id: messages.value.length,
				sender: 'user',
				text: userInput.value,
				})
				registrarHistorico('user', userInput.value)
				userInput.value = ''

				// Adiciona a resposta da IA
				messages.value.push({
				id: messages.value.length,
				sender: 'model',
				text: marked(aiResponse),
				})
				history.push({
				role: 'model',
				parts: [{ text: aiResponse }],
				})
				registrarHistorico('model', aiResponse)

				// Scroll automático
				await nextTick()
				if (chatBox.value) {
				chatBox.value.scrollTop = chatBox.value.scrollHeight
				}
				const lastMessageElement = messageElements.value[messageElements.value.length - 1]
				if (lastMessageElement) {
				lastMessageElement.scrollIntoView({ behavior: 'smooth' })
				}

				loading.value = false
			} catch (error) {
				console.error('Erro ao enviar mensagem para a IA:', error)
				messages.value.push({
				id: messages.value.length,
				sender: 'model',
				text: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.',
				})
				loading.value = false
			}
			}

			// --- HISTÓRICO E ACESSO ---

			const registrarHistorico = async (usuario, mensagem) => {
			try {
				const urlEndPoints = "https://backend-hubsabia.onrender.com"
				const response = await axios.post(urlEndPoints + '/historico', {
				usuario,
				mensagem
				})
				historico.value.push({ usuario, mensagem, timestamp: new Date() })
			} catch (error) {
				console.error('Erro ao registrar conversa:', error)
			}
			}

			const registrarAcesso = async (usuario) => {
			try {
				const urlEndPoints = "https://backend-hubsabia.onrender.com"
				await axios.post(urlEndPoints + '/login', { usuario })
			} catch (error) {
				console.error('Erro ao registrar acesso:', error)
			}
			}

			// --- FILTRO DE MENSAGENS VISÍVEIS ---
			const mensagensVisiveis = computed(() => {
			return messages.value.filter(message => {
				return message.sender === 'user' || message.sender === 'model'
			})
			})

			// --- MOUNTED ---
			onMounted(() => {
			// registrarAcesso('user')
			})

</script>


