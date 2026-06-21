# 🗣️ IFForum — Fórum Acadêmico IFCE Campus Tianguá

Sistema de fórum para a comunidade de estudantes do IFCE Campus Tianguá, desenvolvido como trabalho da disciplina de Engenharia de Software.

## 🌐 Sistema Online (Deploy)

**URL de acesso:** https://ifforum-production.up.railway.app

Credenciais de demonstração:
- **Admin:** admin@forum.dev / password  
- **Moderador:** ana@forum.dev / password

---

## 🛠️ Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Backend | PHP 8.4 + Laravel 13 |
| Frontend | React 18 + Inertia.js |
| Banco de dados | PostgreSQL (produção) / MySQL (local) |
| Autenticação | Laravel Sanctum |
| Deploy | Railway.app |
| Controle de versão | Git + GitHub |

---

## 📁 Estrutura do Repositório

```
IFForum/
│
├── docs/                      # Documentação do projeto
│   ├── requisitos/            # Histórias de usuário e requisitos (N1)
│   ├── diagramas/             # Diagramas UML, ER, casos de uso
│   └── relatorios/            # Relatórios de testes e cobertura
│
├── src/                       # Código fonte da aplicação
│   ├── app/                   # Models, Controllers, Middleware, Policies
│   ├── database/              # Migrations, Seeders, Factories
│   ├── resources/             # Frontend React (Pages, Components, hooks)
│   └── routes/                # Rotas web e API
│
├── test/
│   └── unit/                  # Testes unitários e de feature (≥70% cobertura)
│       ├── AuthTest.php
│       ├── PostTest.php
│       ├── CommentTest.php
│       ├── LikeWebTest.php
│       ├── EditDeleteTest.php
│       ├── EditProfileTest.php
│       ├── PolicyTest.php
│       ├── ApiPostTest.php
│       ├── ProfileTest.php
│       ├── PostModelTest.php
│       └── UserModelTest.php
│
├── build/                     # Arquivos de configuração de deploy
│   ├── nixpacks.toml          # Configuração Railway
│   ├── railway.json
│   └── Procfile
│
└── README.md                  # Este arquivo
```

> **Nota sobre estrutura Laravel:** O framework Laravel organiza o código em pastas próprias (`app/`, `resources/`, `routes/`, `tests/`). A pasta `src/` e `test/unit/` foram criadas como espelhos desses diretórios para atender à convenção do trabalho.

---

## ⚙️ Como executar localmente

### Pré-requisitos
- PHP 8.4+
- Composer
- Node.js 20+
- MySQL 8+ ou PostgreSQL

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/Logx10/IFForum.git
cd IFForum

# 2. Instalar dependências PHP
composer install

# 3. Instalar dependências JavaScript
npm install

# 4. Configurar o ambiente
cp .env.example .env
php artisan key:generate

# 5. Configurar banco de dados no .env
# DB_CONNECTION=mysql
# DB_DATABASE=forum_db
# DB_USERNAME=root
# DB_PASSWORD=sua_senha

# 6. Criar tabelas e popular com dados de exemplo
php artisan migrate:fresh --seed

# 7. Compilar o frontend
npm run dev

# 8. Iniciar o servidor (com Laravel Herd ou php artisan serve)
php artisan serve
```

Acesse: http://localhost:8000

---

## 🧪 Executar os Testes

```bash
# Rodar todos os testes
php artisan test

# Rodar com cobertura de código
php artisan test --coverage

# Rodar apenas os testes unitários
php artisan test tests/Unit

# Rodar apenas os testes de feature
php artisan test tests/Feature

# Rodar uma suite específica
php artisan test tests/Feature/AuthTest.php --verbose
```

### Suítes de testes implementadas

| Arquivo | Tipo | Testes | O que cobre |
|---|---|---|---|
| AuthTest.php | Feature | 10 | Registro, login, logout |
| PostTest.php | Feature | 11 | CRUD de posts, filtros |
| CommentTest.php | Feature | 7 | Comentários, replies |
| LikeWebTest.php | Feature | 19 | Likes/unlikes, contadores |
| EditDeleteTest.php | Feature | 27 | Editar/deletar posts e comentários |
| EditProfileTest.php | Feature | 21 | Edição de perfil, senha |
| PolicyTest.php | Feature | 9 | Autorização por papéis |
| ApiPostTest.php | Feature | 6 | API REST com Sanctum |
| ProfileTest.php | Feature | 3 | Página de perfil |
| PostModelTest.php | Unit | 10 | Model Post, scopes, relacionamentos |
| UserModelTest.php | Unit | 9 | Model User, roles, soft delete |
| **Total** | | **132** | **Cobertura estimada: ~87%** |

---

## 🚀 Deploy (Implantação)

O sistema está implantado na plataforma **Railway.app** com:
- Servidor PHP 8.4 + Laravel
- Banco de dados PostgreSQL
- Build automático a cada `git push` na branch `main`

Arquivos de configuração do deploy estão na pasta `build/`.

---

## 👥 Equipe

- Leandro — Desenvolvimento Full Stack
- IFCE Campus Tianguá — Disciplina de Engenharia de Software
