# Letrando — Web

Plataforma web gamificada de ortografia para escolas. Front-end em Next.js
(React) + Tailwind CSS, back-end em Supabase (Auth + PostgreSQL).

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```


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

