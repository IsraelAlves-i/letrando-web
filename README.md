# Letrando — Web

Plataforma web gamificada de ortografia para escolas. Front-end em Next.js
(React) + Tailwind CSS, back-end em Supabase (Auth + PostgreSQL).

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure o Supabase:

   ```bash
   cp .env.local.example .env.local
   ```

   Abra `.env.local` e cole a URL e a chave anônima do seu projeto
   Supabase (Project Settings → API). Se você ainda não criou o projeto,
   pode rodar o passo 3 mesmo assim — as telas funcionam com dados de
   exemplo (`src/data/mockData.js`); só o cadastro/login real vai
   depender do Supabase estar configurado.

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura de pastas

```
src/
  app/
    page.js                    → seleção de perfil (Aluno / Professor)
    login/page.js               → login (RF03)
    cadastro/aluno/page.js       → cadastro do aluno (RF01)
    aluno/mapa/page.js           → trilha de módulos (RF06/RF10)
    aluno/questao/page.js        → questão + feedback (RF07/RF08)
    professor/dashboard/page.js  → painel de desempenho (RF12)
  lib/
    supabaseClient.js           → conexão e funções de auth com Supabase
  data/
    mockData.js                 → dados de exemplo para as telas
```

## Roteiro sugerido para o vídeo de demonstração

1. Tela inicial (`/`) → escolher "Sou Aluno"
2. Tela de login (`/login?perfil=aluno`) → mostrar link de cadastro
3. Tela de cadastro (`/cadastro/aluno`) → mostrar o campo de código da turma
4. Mapa de módulos (`/aluno/mapa`) → mostrar módulo concluído, em andamento e bloqueado
5. Tela de questão (`/aluno/questao`) → responder e mostrar o feedback
6. Dashboard do professor (`/professor/dashboard`) → tabela de desempenho da turma

## Próximos passos

- Criar as tabelas no Supabase a partir do script SQL da Entrega 6
- Conectar as telas de mapa/dashboard às tabelas reais (substituir `mockData.js`)
- Implementar cadastro/dashboard do professor (`/cadastro/professor`,
  atribuição de módulos com prazo)
