# 10 Próximos Passos Lógicos para a Plataforma

Com a análise da Birthub Academy e o novo overlay **Excellence 35**, o roadmap imediato consiste em estabilizar as bases técnicas introduzidas, implementar os itens de maior impacto e integrar a plataforma aos testes finais (como o Playwright).

## Passo 1: Consolidação do Banco de Dados (Migration Oficial)
- **O que fazer:** Criar as migrações Prisma oficiais (`prisma migrate dev`) para refletir os novos modelos (ex: `ExcellenceItem` e `Competency`) e substituir o script opcional `excellence-models.sql`.
- **Por quê:** Substituir execuções manuais de SQL por versionamento estrito e ORM nativo.

## Passo 2: Validar e Tipar Inputs Estritos nos Módulos de Backend
- **O que fazer:** Corrigir os alertas de tipagem e a falta de typings explícitos apontados durante o `typecheck`, incluindo `Prisma.InputJsonValue` e enums (`RoleCode`) no módulo de `admin` e `excellence`.
- **Por quê:** Melhorar a segurança da API e evitar quebras de build no deploy.

## Passo 3: Implementar Item 11 (Motor Pedagógico de Excelência)
- **O que fazer:** Finalizar o fluxo de backend persistindo planos reais de estudos (`learning-plan`) por aluno, com suporte multi-tenant.
- **Por quê:** Essencial para o pilar de personalização e base das próximas entregas.

## Passo 4: Implementar Item 12 (Plataforma Adaptativa)
- **O que fazer:** Desenvolver as regras lógicas de `adaptive-learning` na trilha LMS. O sistema deve ajustar a dificuldade dinamicamente através de métricas colhidas por engajamento.
- **Por quê:** Otimização real de tempo e aumento da retenção dos alunos.

## Passo 5: Implementar Item 13 (Tutor de IA Educacional)
- **O que fazer:** Conectar de fato um modelo LLM ao endpoint `/excellence/ai-tutor`, utilizando engenharia de prompt educacional e evitando dar a resposta (prompting socrático).
- **Por quê:** Ofertar suporte premium 24x7.

## Passo 6: Implementar Item 14 (Avaliação Avançada e Anticolagem)
- **O que fazer:** Evoluir as tabelas de submissões (`Submission`) para injetar checagem de plágio e telemetria de avaliações (integridade).
- **Por quê:** Autenticidade e confiabilidade da certificação.

## Passo 7: Resolver Container/Infra para Testes E2E (Minio/Playwright)
- **O que fazer:** Averiguar as permissões de extração e rodar o container do Minio e BD isoladamente (`docker-compose up`) que estão impedindo testes locais pelo Playwright.
- **Por quê:** Todo dev local precisa rodar os testes sem atrito na porta `55432`.

## Passo 8: Deploy Homologação (Staging)
- **O que fazer:** Desdobrar as mudanças e a suite de excelência nas esteiras de CI/CD para um ambiente real (AWS/Vercel).
- **Por quê:** Validar o overlay Excelência 35 com beta testers em simulação produtiva.

## Passo 9: Funcionalidades P2 (Dashboard e Analytics)
- **O que fazer:** Iniciar os épicos P2: `academic-analytics` e `student-success-support`. Focando na construção de dashboards em React (Web) conectados à base.
- **Por quê:** Gestores precisam ter visibilidade dos cohorts.

## Passo 10: Lançamento em Produção e Acompanhamento
- **O que fazer:** Efetivar as instâncias em Prod, habilitar auditoria completa e acompanhar a volumetria de usuários nos primeiros ciclos.
- **Por quê:** Encerrar o ciclo de desenvolvimento inicial da Birthub Academy e entregar valor aos alunos.
