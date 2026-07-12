# Analise e Prompt Mestre V5 - Plataforma de Curso Inside Sales, IA e Automacao

## Diagnostico dos materiais analisados

### Arquivos avaliados

- `PROMPT_MESTRE_GEMINI_V4_CURSO_INSIDE_SALES_IA_AUTOMACAO.txt`
- `Estrutura do Curso Inside Sales.pdf`
- `Apresentacao dos Modulos 6 e 7.pdf`
- `CONTEUDO_COMPLETO_MODULOS_6_E_7_IA_AUTOMACAO.html`

### Diagnostico objetivo

O prompt V4 ja tem boa disciplina editorial, regras de fonte, validacao, quizzes, progressao, certificados e qualidade. O principal problema e que ele ainda manda construir uma entrega em HTML/CSS/JS local, o que limita escala, gestao, seguranca, persistencia real, certificados verificaveis, administracao de alunos, turmas, conteudo e operacao nacional.

O PDF `Estrutura do Curso Inside Sales.pdf` define a base original do curso: 5 modulos, 23 ciclos, atividades, quizzes, bloqueios, desafio final e certificado. O HTML `CONTEUDO_COMPLETO_MODULOS_6_E_7_IA_AUTOMACAO.html` complementa isso com 14 ciclos completos dos modulos 6 e 7, incluindo conteudo, atividades, checklists, projetos e 280 questoes comentadas. A apresentacao dos modulos 6 e 7 reforca o principio central: IA e automacao devem apoiar o profissional, com validacao humana, rastreabilidade, seguranca, respeito aos canais e protecao de dados.

### Decisao da versao V5

Esta versao substitui a entrega HTML/PWA local por uma plataforma educacional full-stack, preparada para escala no Brasil:

- Frontend em Next.js + TypeScript, organizado por componentes e rotas.
- Backend em NestJS + TypeScript, com API, autenticacao, autorizacao, jobs e auditoria.
- Banco PostgreSQL com Prisma, migracoes, seeds e modelo multi-tenant.
- Redis/BullMQ para filas, processamento de importacao, certificados, e-mails e relatorios.
- Armazenamento S3-compativel para anexos, certificados, exports e materiais.
- Docker Compose para desenvolvimento local e base reproduzivel.
- CI, testes automatizados, acessibilidade, seguranca, LGPD, observabilidade e documentacao.

Importante: a plataforma ainda renderizara HTML no navegador, como qualquer aplicacao web, mas a entrega nao pode ser um site estatico em HTML solto. Deve existir produto real com backend, banco, usuarios, perfis, progresso, painel administrativo, avaliacao, certificado verificavel e operacao escalavel.

---

# PROMPT MESTRE V5.0

## PLATAFORMA NACIONAL DE CURSOS - INSIDE SALES, IA E AUTOMACAO COMERCIAL

LEIA TODO ESTE PROMPT ANTES DE INICIAR. NAO RESPONDA APENAS COM UM PLANO. EXECUTE O TRABALHO, CRIE OS ARQUIVOS REAIS, RODE AS VALIDACOES POSSIVEIS E DOCUMENTE O QUE FOI FEITO.

Voce deve transformar os arquivos-fonte fornecidos em uma plataforma educacional full-stack, robusta, escalavel e pronta para evoluir como produto nacional no Brasil. A entrega nao deve ser um arquivo HTML estatico, nem um prototipo visual. Deve ser uma aplicacao real, com frontend, backend, banco de dados, importacao de conteudo, gestao de alunos, progresso, avaliacoes, atividades, projetos, certificados verificaveis, painel administrativo, seguranca, LGPD, testes e documentacao.

## 0. Principios inegociaveis

1. Nao finja que leu, criou, testou, validou ou executou algo que nao foi realmente feito.
2. Nao invente conteudo para encobrir fonte ausente, truncada, corrompida ou incompleta.
3. Nao copie transcricoes brutas como aula final. Transforme o conhecimento em conteudo autoral, claro, didatico, correto, rastreavel e atualizado.
4. Nao entregue apenas landing page, mockup, prototipo, pseudocodigo ou HTML estatico.
5. Nao deixe botao, rota, link, formulario, fluxo ou acao sem funcao real.
6. Nao exponha chave de API, token, segredo, credencial ou dado pessoal sensivel no frontend, no repositorio ou nos logs.
7. Toda simulacao deve ser marcada como `[SIMULACAO]`.
8. Integracoes reais so podem existir com variaveis de ambiente, adapters, tratamento de erro, logs, limites, seguranca e documentacao.
9. Certificado so pode ser declarado verificavel se existir backend, rota publica de validacao, codigo unico e regra de emissao persistida no banco.
10. IA e automacao devem ser ensinadas e implementadas como apoio ao profissional, com validacao humana, rastreabilidade, governanca, seguranca, LGPD e respeito as politicas dos canais.

## 1. Papel da equipe

Atue como uma equipe integrada:

- Arquiteto de produto SaaS e LMS.
- Especialista senior em Inside Sales, SDR, BDR, LDR, RevOps e vendas B2B.
- Especialista em IA aplicada a vendas, LLMs, RAG, copilotos, agentes, avaliacao e guardrails.
- Especialista em automacao comercial, CRM, webhooks, APIs, filas, idempotencia e observabilidade.
- Designer instrucional e especialista em educacao de adultos.
- Especialista em avaliacao educacional, rubricas e banco de questoes.
- Product designer para plataformas educacionais.
- Engenheiro frontend senior em Next.js, React, TypeScript e acessibilidade.
- Engenheiro backend senior em NestJS, PostgreSQL, Prisma, seguranca e arquitetura.
- Especialista em DevOps, CI/CD, Docker, observabilidade, backups e escalabilidade.
- Especialista em seguranca, privacidade, LGPD e governanca.
- QA responsavel por testes unitarios, integracao, e2e, acessibilidade, conteudo e regressao.

Priorize conflitos nesta ordem:

1. Integridade, rastreabilidade e correcao do conteudo.
2. Seguranca, privacidade, LGPD e honestidade tecnica.
3. Funcionamento real da plataforma.
4. Acessibilidade.
5. Aprendizagem, usabilidade e avaliacao justa.
6. Desempenho, manutencao e escala.
7. Estetica.

## 2. Missao final

Criar uma plataforma educacional full-stack para o curso premium:

**Inside Sales com Inteligencia Artificial e Automacao Comercial**

A plataforma deve conter:

- 7 modulos e exatamente 37 ciclos.
- Conteudo completo, revisado e rastreavel.
- 37 atividades praticas obrigatorias.
- 37 quizzes, um por ciclo.
- Banco minimo de 20 questoes por ciclo, total minimo de 740 questoes.
- Exibicao de 10 questoes por tentativa, com sorteio controlado.
- Aprovacao minima de 70%, equivalente a 7 acertos.
- Progressao bloqueada por ciclo, modulo, projetos, desafio final e certificado.
- Recuperacao personalizada por temas errados.
- Projeto do Modulo 6: Copiloto Comercial de IA.
- Projeto do Modulo 7: Automacao Comercial Ponta a Ponta.
- Desafio Final Integrador: Operacao de Inside Sales com IA e Automacao.
- Gamificacao responsavel com XP, niveis, conquistas e progresso.
- Laboratorio educacional de IA.
- Construtor educacional de automacoes.
- Biblioteca de prompts.
- Biblioteca de automacoes.
- Painel do aluno.
- Painel administrativo.
- Gestao de organizacoes, turmas, matriculas, progresso, avaliacoes e certificados.
- Autenticacao, autorizacao, perfis e auditoria.
- Persistencia server-side em banco de dados.
- Exportacao e importacao de progresso, respostas e relatorios.
- Certificado com validacao publica via backend.
- Documentacao, scripts de validacao, testes e relatorio final.

## 3. Entrega tecnica obrigatoria

E proibido entregar como `index.html` estatico, HTML unico, HTML/PWA local-only ou site sem backend. A entrega deve ser uma aplicacao full-stack.

### Stack definida

Use esta arquitetura, salvo impossibilidade tecnica documentada:

- Monorepo com `pnpm workspaces`.
- Frontend: Next.js, React, TypeScript, App Router, componentes acessiveis e design system.
- Backend: NestJS, TypeScript, API REST documentada em OpenAPI.
- Banco: PostgreSQL.
- ORM/migracoes: Prisma.
- Filas/cache: Redis + BullMQ.
- Storage: S3-compativel com adapter local para desenvolvimento.
- Validacao: Zod ou equivalente para schemas compartilhados.
- Testes: Vitest/Jest, Playwright, axe-core ou equivalente.
- Qualidade: ESLint, Prettier, TypeScript strict, auditoria de dependencias.
- Infra local: Docker Compose.
- CI: workflow com install, lint, typecheck, test, build, migracoes em ambiente de teste e e2e.

### Estrutura minima do repositorio

```text
plataforma-inside-sales-ia-automacao/
  apps/
    web/
      app/
      components/
      features/
      lib/
      public/
      tests/
    api/
      src/
        modules/
        common/
        jobs/
        auth/
        audit/
      test/
    worker/
      src/
  packages/
    db/
      prisma/
      seed/
    schemas/
    content/
    ui/
    config/
    test-utils/
  data/
    raw/
    normalized/
    imports/
    exports/
  docs/
    source-manifest.md
    content-audit.md
    conflict-log.md
    product-requirements.md
    instructional-design.md
    architecture.md
    data-model.md
    api.md
    security-privacy-lgpd.md
    accessibility.md
    testing-report.md
    deployment.md
    build-status.md
  scripts/
    import-sources.ts
    normalize-content.ts
    validate-content.ts
    validate-questions.ts
    validate-links.ts
    generate-openapi.ts
    generate-seed.ts
  infra/
    docker-compose.yml
    docker-compose.test.yml
  .github/
    workflows/
      ci.yml
  package.json
  pnpm-workspace.yaml
  README.md
  CHANGELOG.md
  LICENSES.md
  .env.example
```

## 4. Fontes obrigatorias e hierarquia

Classifique e use todos os arquivos fornecidos.

### Nivel A - Regras, estrutura e filosofia

- Este Prompt Mestre V5.
- `Estrutura do Curso Inside Sales.pdf`.
- `Apresentacao dos Modulos 6 e 7.pdf`.
- Documentos de desafio final, se fornecidos.
- Regras explicitas do usuario.

### Nivel B - Conteudo autoritativo

- Arquivos `.txt` dos modulos 1 a 5, quando fornecidos.
- Transcricoes ou materiais equivalentes dos 23 ciclos base.
- `CONTEUDO_COMPLETO_MODULOS_6_E_7_IA_AUTOMACAO.html`, fonte autoritativa dos modulos 6 e 7.
- Materiais complementares expressamente identificados pelo autor.

### Nivel C - Atualizacao externa

- Documentacao oficial e atual de LGPD, ANPD, canais, IA, automacao, CRM, mensageria, email, acessibilidade e seguranca.
- Use fontes oficiais ou documentacao primaria sempre que uma regra, politica, ferramenta ou lei puder ter mudado.
- Registre fonte, URL, data de consulta, assunto e trecho afetado em `docs/sources.md`.

### Resolucao de conflitos

1. O PDF original define 5 modulos e 23 ciclos.
2. Os arquivos dos modulos 6 e 7 adicionam 14 ciclos.
3. A versao final obrigatoria deste projeto e 7 modulos e 37 ciclos.
4. O HTML completo dos modulos 6 e 7 deve ser importado, normalizado e validado, nao descartado.
5. Quando uma fonte externa atualizar uma pratica, registre a decisao sem apagar a intencao pedagogica original.
6. Todo conflito deve aparecer em `docs/conflict-log.md`, com fontes envolvidas, decisao e justificativa.

## 5. Pre-voo e manifesto de fontes

Antes de criar conteudo ou codigo de produto:

1. Varra todos os arquivos anexados.
2. Calcule hash, tamanho, extensao, ultima modificacao e contagem aproximada de palavras.
3. Extraia texto de PDF e HTML com ferramentas adequadas.
4. Preserve copia em `data/raw/` quando permitido.
5. Crie `docs/source-manifest.md` e `data/normalized/source-manifest.json`.
6. Para cada fonte, registre:
   - nome exato;
   - caminho;
   - tipo;
   - modulo/ciclo relacionado;
   - idioma;
   - prioridade;
   - condicao: completo, incompleto, duplicado, corrompido, parcial ou irrelevante;
   - qualidade textual;
   - existencia de timestamps;
   - existencia de metadados de transcricao;
   - observacoes e riscos.
7. Confirme:
   - 23 ciclos base dos modulos 1 a 5;
   - 14 ciclos dos modulos 6 e 7;
   - total final de 37 ciclos;
   - presenca das 280 questoes dos modulos 6 e 7 no HTML;
   - necessidade de criar ou completar as 460 questoes dos modulos 1 a 5.
8. Registre bloqueios criticos e alertas nao bloqueantes.

Se uma fonte critica estiver ausente, marque a parte como `PARCIAL` e continue com o que puder ser feito com seguranca.

## 6. Mapa obrigatorio do curso

### Modulo 1 - Fundamentos de Inside Sales

1.1 Glossario de Inside Sales
1.2 Funil de Vendas
1.3 Vendas Consultivas
1.4 O que e Inbound
1.5 O que e Outbound
1.6 Definindo o ICP
1.7 Ferramentas de Inside Sales

### Modulo 2 - Qualificacao e Tecnicas de Abordagem

2.1 Tecnicas de Abordagem
2.2 Frameworks de Vendas
2.3 BANT
2.4 GPCT
2.5 SPIN Selling
2.6 Cold Call

### Modulo 3 - Prospeccao Multicanal

3.1 Criacao de Listas
3.2 Criacao de Listas na Pratica
3.3 Social Selling no WhatsApp
3.4 Social Selling no LinkedIn
3.5 Fluxo de Cadencia
3.6 Cold Mail
3.7 Oratoria
3.8 Objecoes

### Modulo 4 - Transicao para Vendas

4.1 Passagem de Bastao

### Modulo 5 - Carreira em Inside Sales

5.1 Carreira em Inside Sales

### Modulo 6 - Inteligencia Artificial Aplicada a Vendas

6.1 Fundamentos de Inteligencia Artificial para Vendas
6.2 Engenharia de Prompts para Profissionais de Vendas
6.3 IA para Encontrar Empresas e Clientes Potenciais
6.4 IA para Enriquecimento e Qualificacao de Leads
6.5 IA para Prospeccao Personalizada em Escala
6.6 IA para Reunioes, Negociacao e Fechamento
6.7 Assistentes, Copilotos e Agentes Comerciais

### Modulo 7 - Automacao Completa do Fluxo Comercial

7.1 Fundamentos e Mapeamento de Processos Comerciais
7.2 Automacao da Captura, Organizacao e Enriquecimento de Leads
7.3 Automacao da Prospeccao e da Cadencia Multicanal
7.4 Automacao da Qualificacao, Distribuicao e Agendamento
7.5 Automacao do CRM, Pipeline e Gestao de Oportunidades
7.6 Automacao de Propostas, Follow-up, Fechamento e Passagem de Bastao
7.7 Arquitetura de Automacao Comercial de Ponta a Ponta

Depois dos ciclos:

- Projeto do Modulo 6.
- Projeto do Modulo 7.
- Desafio Final Integrador.
- Certificado.

## 7. Contrato pedagogico de cada ciclo

Cada ciclo deve conter, no banco e na interface:

1. Codigo e titulo.
2. Descricao curta.
3. Objetivos mensuraveis.
4. Competencias desenvolvidas.
5. Pre-requisitos.
6. Tempo estimado.
7. Nivel.
8. Introducao contextual.
9. Conteudo principal dividido em blocos.
10. Definicoes de termos-chave.
11. Exemplos praticos.
12. Estudo de caso real, ficticio ou simulado, corretamente identificado.
13. Tabela, matriz, fluxo ou modelo visual quando aplicavel.
14. Erros comuns.
15. Boas praticas.
16. Checklist de aprendizagem.
17. Resumo executivo.
18. Glossario rapido.
19. Atividade pratica obrigatoria.
20. Instrucoes de entrega.
21. Rubrica objetiva.
22. Quiz associado.
23. Recuperacao personalizada por tema.
24. Referencias e fontes.
25. Condicao de desbloqueio.

## 8. Conteudo dos modulos 1 a 5

Use as transcricoes, textos ou materiais fornecidos como fonte principal. O PDF de estrutura define, no minimo, os temas esperados.

Se os arquivos de aula dos modulos 1 a 5 nao estiverem presentes:

- nao invente que foram lidos;
- use o PDF apenas como estrutura minima;
- marque o conteudo como `PARCIAL - fonte base ausente`;
- produza um conteudo pedagogico inicial com base na estrutura, mas deixe claro o que precisa de validacao do autor.

Limpe transcricoes removendo timestamps, repeticoes, vicios de linguagem, erros obvios de reconhecimento e propaganda que nao ensine o tema. Preserve conceitos, exemplos relevantes, raciocinios e intencao pedagogica.

## 9. Conteudo dos modulos 6 e 7

Use `CONTEUDO_COMPLETO_MODULOS_6_E_7_IA_AUTOMACAO.html` como fonte autoritativa. Ele contem:

- 14 ciclos completos.
- Conteudo didatico estruturado.
- Atividades praticas.
- Checklists.
- Projetos dos modulos.
- 280 questoes comentadas.
- Referencias oficiais de atualizacao.

Obrigatorio:

- Extrair semanticamente o HTML.
- Normalizar conteudo para o modelo de dados da plataforma.
- Importar e validar as 280 questoes.
- Preservar a filosofia de uso responsavel de IA e automacao.
- Registrar qualquer alteracao editorial em `docs/content-audit.md`.

Nao rebaixe esses modulos a resumos genericos. Eles devem ser absorvidos como conteudo real do curso.

## 10. Avaliacoes, quizzes e recuperacao

Regras:

- 37 quizzes.
- Minimo de 20 questoes por ciclo.
- Total minimo de 740 questoes.
- Modulos 6 e 7 devem importar 280 questoes do HTML, salvo erro documentado.
- Modulos 1 a 5 devem ter pelo menos 460 questoes no total.
- Cada tentativa exibe exatamente 10 questoes:
  - 3 faceis;
  - 5 medias;
  - 2 avancadas.
- Aprovacao minima: 70%.
- Feedback por alternativa.
- Justificativa da resposta correta.
- Referencia ao bloco de conteudo.
- Historico de tentativas.
- Melhor nota persistida.
- Recuperacao personalizada por tema errado.

O sorteio deve ocorrer no backend ou por regra persistida e auditavel. Nao permita que o aluno desbloqueie etapas alterando URL, payload local ou estado do navegador.

## 11. Atividades, projetos e desafio final

Cada ciclo tem uma atividade pratica obrigatoria com:

- objetivo;
- contexto;
- instrucoes;
- campos de entrega;
- exemplos permitidos;
- criterios de avaliacao;
- rubrica com pelo menos 4 niveis;
- status de revisao;
- exportacao.

Projeto do Modulo 6:

**Copiloto Comercial de IA**

Deve exigir: objetivo, usuario, tarefas, entradas, fontes, saidas, memoria, ferramentas, permissoes, acoes permitidas, acoes proibidas, pontos de aprovacao humana, riscos, logs, metricas, testes, criterios de sucesso e contingencia.

Projeto do Modulo 7:

**Automacao Comercial Ponta a Ponta**

Deve exigir: AS-IS, TO-BE, gatilhos, condicoes, acoes, delays, integracoes, dados, CRM, captura, enriquecimento, distribuicao, cadencia, agendamento, no-show, proposta, assinatura, handoff, logs, alertas, tratamento de erros, rollback, metricas e LGPD.

Desafio Final:

**Operacao de Inside Sales com IA e Automacao**

Partes obrigatorias:

1. Estrategia comercial.
2. Prospeccao.
3. Abordagem.
4. Inteligencia Artificial.
5. Automacao.
6. Gestao e indicadores.

Rubrica com 15 criterios:

1. Coerencia do ICP.
2. Qualidade da lista.
3. Personalizacao.
4. Qualidade das perguntas.
5. Aplicacao dos frameworks.
6. Qualidade das abordagens.
7. Uso responsavel da IA.
8. Clareza dos prompts.
9. Seguranca.
10. LGPD.
11. Coerencia das automacoes.
12. Tratamento de erros.
13. Aprovacao humana.
14. Qualidade dos indicadores.
15. Viabilidade da operacao.

## 12. Funcionalidades da plataforma

### Portal do aluno

- Cadastro, login e recuperacao de acesso.
- Perfil e consentimentos.
- Dashboard de progresso.
- Trilhas por modulo e ciclo.
- Leitor de aula.
- Player ou area de material, se midias forem fornecidas.
- Atividades e rascunhos.
- Quizzes e historico.
- Recuperacao.
- Projetos.
- Desafio final.
- Biblioteca de prompts.
- Biblioteca de automacoes.
- Laboratorio de IA.
- Construtor de automacoes.
- Certificado.
- Exportacao dos proprios dados.
- Solicitacao de exclusao de dados.

### Painel administrativo

- Gestao de organizacoes e tenants.
- Gestao de usuarios, papeis e permissoes.
- Gestao de turmas, matriculas e convites.
- Editor de curso, modulos, ciclos e blocos.
- Banco de questoes.
- Importador de fontes.
- Auditoria de fontes e versoes.
- Rubricas e avaliacoes.
- Revisao de atividades e projetos.
- Dashboard de progresso.
- Emissao e revogacao de certificados.
- Logs de auditoria.
- Configuracoes de privacidade e retencao.
- Configuracoes de integracoes.

### Modelo multi-tenant

Suporte a:

- B2C direto para alunos individuais.
- B2B para empresas.
- Turmas por organizacao.
- Administradores por tenant.
- Instrutores e avaliadores.
- Alunos com acesso restrito ao proprio tenant.
- Isolamento logico por `tenantId`.
- Auditoria por tenant.

## 13. Modelo de dados minimo

Crie schema Prisma contemplando, no minimo:

- User
- Organization
- Membership
- Role
- Permission
- Course
- CourseVersion
- Module
- Cycle
- LessonBlock
- Activity
- Rubric
- RubricCriterion
- Question
- QuestionOption
- QuizAttempt
- QuizAttemptAnswer
- Enrollment
- ProgressEvent
- Submission
- Project
- FinalChallenge
- Certificate
- CertificateVerification
- SourceFile
- SourceChunk
- ContentAudit
- ConflictLog
- Consent
- AuditLog
- NotificationPreference
- AIInteractionLog
- PromptTemplate
- AutomationTemplate
- AutomationSimulation
- ImportJob
- ExportJob
- PaymentOrder ou BillingRecord, se checkout for implementado

Use IDs estaveis, timestamps, soft delete onde fizer sentido, campos de auditoria e indices para tenant, usuario, curso, ciclo e certificado.

## 14. Laboratorio de IA

Crie um laboratorio educacional de IA com dois modos:

1. **Modo simulado**: funciona sem chave externa e deve ser claramente marcado como `[SIMULACAO]`.
2. **Modo provedor real**: opcional, server-side, via adapter, com variaveis de ambiente, rate limit, logs redigidos, consentimento, controle de custo e documentacao.

Obrigatorio:

- Nunca chamar IA diretamente do frontend com chave exposta.
- Nunca enviar dados pessoais reais sem consentimento, finalidade e configuracao adequada.
- Diferenciar fato, hipotese, inferencia e simulacao.
- Salvar historico educacional quando o aluno consentir.
- Permitir exportacao e exclusao.
- Incluir biblioteca de prompts por ciclo.
- Incluir avaliador simples de qualidade do prompt.
- Incluir alertas de seguranca e LGPD.

## 15. Construtor de automacoes

Crie um construtor educacional com:

- Triggers.
- Condicoes.
- Acoes.
- Delays.
- Branches.
- Fallbacks.
- Tratamento de erro.
- Logs simulados.
- Visao visual.
- Visao textual acessivel.
- Validacao de fluxo.
- Importacao/exportacao JSON.
- Templates editaveis.

Nao execute automacoes reais em ferramentas externas sem adapter, configuracao segura, logs, rate limits, aprovacao humana e documentacao. Por padrao, o construtor deve simular.

Inclua pelo menos 20 templates:

1. Lead de formulario para CRM.
2. Enriquecimento de lead.
3. Deduplicacao.
4. Lead scoring.
5. Distribuicao automatica.
6. Cadencia outbound.
7. Follow-up inbound.
8. Recuperacao de no-show.
9. Reativacao de oportunidade.
10. Alerta de negocio parado.
11. Atualizacao automatica do CRM.
12. Resumo de reuniao.
13. Geracao de tarefas.
14. Envio de proposta.
15. Aprovacao de desconto.
16. Assinatura e fechamento.
17. Passagem para Customer Success.
18. Pesquisa de satisfacao.
19. Renovacao.
20. Upsell e cross-sell.

## 16. Certificados

Liberar certificado somente quando:

- 37 ciclos concluidos.
- 37 atividades entregues.
- 37 quizzes aprovados.
- Projeto do Modulo 6 concluido.
- Projeto do Modulo 7 concluido.
- Desafio Final aprovado.
- Media geral igual ou superior a 70%.

Certificado deve conter:

- nome do aluno;
- curso;
- carga horaria;
- data de emissao;
- nota final;
- competencias;
- codigo unico;
- URL publica de verificacao;
- QR Code para a URL real;
- versao do curso;
- instituicao;
- responsavel;
- status: valido, revogado ou expirado, se aplicavel.

Nao crie QR Code para URL inexistente. A verificacao deve consultar o backend.

## 17. Pagamentos e escala Brasil

Se implementar comercializacao:

- Use arquitetura por adapter para gateways.
- Suporte conceitual a Pix, cartao, boleto e compra corporativa, sem depender de um unico fornecedor.
- Nao prometa pagamento real se as credenciais nao existirem.
- Webhooks devem ser idempotentes.
- Registre eventos de pagamento.
- Separe matricula de pagamento.
- Trate reembolso, cancelamento e expiracao de acesso.
- Nao armazene dados de cartao.

Para escala nacional:

- Preparar app para CDN.
- Usar object storage para arquivos.
- Usar filas para jobs demorados.
- Implementar paginacao, busca e indices.
- Implementar rate limiting.
- Implementar backup e restore documentados.
- Implementar observabilidade minima.
- Separar ambientes local, teste, homologacao e producao.
- Usar feature flags para recursos de IA e integracoes.

## 18. Seguranca, privacidade e LGPD

Obrigatorio:

- Senhas com hash forte.
- Sessao/cookie seguro; nao usar token sensivel em localStorage.
- CSRF quando aplicavel.
- Protecao contra XSS, SQL injection, SSRF, path traversal e upload inseguro.
- Validacao server-side de todas as entradas.
- Sanitizacao de conteudo rico.
- RBAC/ABAC por tenant.
- Logs de auditoria.
- Mascaramento de dados sensiveis.
- Politica de retencao.
- Exportacao de dados do titular.
- Exclusao ou anonimizacao quando aplicavel.
- Consentimentos versionados.
- Politica de privacidade.
- Termos de uso.
- Nenhum analytics oculto.

No conteudo educacional, ensinar:

- finalidade;
- adequacao;
- necessidade;
- transparencia;
- seguranca;
- prevencao;
- nao discriminacao;
- responsabilizacao;
- opt-out;
- politicas de WhatsApp, LinkedIn e email;
- proibicao de spam, scraping abusivo, identidade falsa e automacao enganosa.

## 19. UX, design e acessibilidade

A interface deve ser:

- Profissional, moderna e clara.
- Mobile-first.
- Responsiva.
- Acessivel com meta WCAG 2.2 AA.
- Adequada para estudo longo.
- Sem excesso de efeitos decorativos.
- Com modo claro e escuro.
- Com estados de loading, vazio, erro e sucesso.

Obrigatorio:

- Navegacao por teclado.
- Foco visivel.
- Landmarks semanticos.
- Labels corretos.
- Contraste adequado.
- Tabelas acessiveis.
- Formularios com erros associados.
- Modais com focus trap.
- Suporte a zoom 200%.
- `prefers-reduced-motion`.
- Alternativa textual para o construtor visual.

## 20. Validadores e testes

Crie scripts que falhem com codigo diferente de zero quando requisitos nao forem atendidos.

### `validate-content`

Verificar:

- exatamente 7 modulos;
- exatamente 37 ciclos;
- ordem correta;
- 37 atividades;
- 37 quizzes;
- 2 projetos;
- 1 desafio final;
- campos obrigatorios;
- referencias internas;
- ausencia de TODO, lorem ipsum e placeholder.

### `validate-questions`

Verificar:

- minimo 20 questoes por ciclo;
- minimo 740 questoes;
- ids unicos;
- dificuldade;
- alternativas;
- resposta correta;
- feedback;
- justificativa;
- referencia ao conteudo;
- ausencia de duplicatas normalizadas.

### Testes de plataforma

Inclua:

- testes unitarios de regras de progresso;
- testes de quiz;
- testes de autorizacao;
- testes de certificado;
- testes de importacao;
- testes de LGPD/exportacao/exclusao;
- testes de API;
- testes e2e com Playwright;
- testes de acessibilidade;
- testes de fluxo mobile;
- testes de certificado imprimivel;
- teste de tentativa de desbloqueio por URL;
- teste de isolamento entre tenants.

## 21. Fluxo de execucao

Trabalhe em etapas verificaveis.

### Etapa 0 - Inventario

- Ler fontes.
- Extrair PDF/HTML/TXT.
- Criar manifestos.
- Registrar conflitos.
- Confirmar contagens.

### Etapa 1 - Produto, arquitetura e schemas

- PRD.
- Arquitetura.
- Modelo de dados.
- Schemas.
- Design system.
- Plano de seguranca e LGPD.

### Etapa 2 - Base tecnica

- Monorepo.
- Docker Compose.
- Banco.
- Prisma.
- API.
- Frontend.
- Auth.
- RBAC.
- Seeds.
- CI inicial.

### Etapa 3 - Importacao e normalizacao de conteudo

- Importar fontes.
- Normalizar ciclos.
- Importar questoes dos modulos 6 e 7.
- Criar/completar conteudo dos modulos 1 a 5 conforme fontes.
- Gerar auditoria.

### Etapa 4 - LMS core

- Portal do aluno.
- Progresso.
- Bloqueios.
- Aulas.
- Atividades.
- Quizzes.
- Recuperacao.
- Gamificacao.

### Etapa 5 - Modulos avancados

- Laboratorio de IA.
- Biblioteca de prompts.
- Construtor de automacoes.
- Biblioteca de automacoes.
- Projetos.
- Desafio final.

### Etapa 6 - Administracao

- Painel admin.
- Gestao de turmas.
- Gestao de usuarios.
- Editor de conteudo.
- Banco de questoes.
- Rubricas.
- Relatorios.
- Certificados.

### Etapa 7 - Escala, seguranca e deploy

- Observabilidade.
- Rate limit.
- Jobs.
- Backups.
- Documentacao de deploy.
- Politicas LGPD.
- Hardening.

### Etapa 8 - Testes e empacotamento

- Rodar lint.
- Rodar typecheck.
- Rodar testes.
- Rodar validadores de conteudo.
- Rodar e2e possivel.
- Corrigir falhas.
- Criar relatorio.
- Criar ZIP final se o ambiente permitir.

Atualize `docs/build-status.md` apos cada etapa.

## 22. Criterios de aceite final

So declare concluido quando:

- Todas as fontes foram inventariadas.
- A hierarquia de fontes foi aplicada.
- Ha exatamente 7 modulos e 37 ciclos.
- Ha 37 atividades.
- Ha 37 quizzes.
- Ha pelo menos 740 questoes validas.
- Ha 2 projetos e 1 desafio final.
- Modulos 6 e 7 absorvem o conteudo do HTML completo.
- Plataforma nao e HTML estatico.
- Login funciona.
- Banco e migracoes existem.
- Progresso persiste no backend.
- Bloqueios funcionam.
- Certificado so libera com criterios corretos.
- Certificado possui validacao publica real.
- Painel administrativo existe.
- Laboratorio de IA e honesto sobre simulacao/integracao real.
- Construtor de automacoes salva, valida, importa e exporta.
- LGPD, privacidade e seguranca estao documentadas.
- Testes e validadores foram executados ou suas limitacoes foram registradas.
- README permite rodar o projeto localmente.
- Nenhum TODO, lorem ipsum ou placeholder permanece em areas obrigatorias.

## 23. Formato da resposta final

Na resposta final, entregue apenas:

1. Diagnostico das fontes.
2. Etapas concluidas.
3. Decisoes principais.
4. Comandos executados e resultados.
5. Limitacoes reais.
6. Caminhos dos arquivos gerados.
7. Como rodar localmente.

Nao despeje todo o codigo no chat se arquivos puderem ser criados.

## Inicio da execucao

Comece agora pela Etapa 0 - Inventario.

Leia integralmente as fontes anexadas, extraia o conteudo de PDF/HTML/TXT, crie o manifesto, registre conflitos e confirme as contagens. Depois avance automaticamente para arquitetura, conteudo, plataforma, testes e empacotamento, interrompendo somente por bloqueio critico real.
