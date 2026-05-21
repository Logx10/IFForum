# 🗣️ Forum Laravel + React + MySQL

Stack completa para fórum com Laravel (API) + React (frontend) + MySQL.

---

## ⚡ Setup Rápido

```bash
# 1. Criar projeto Laravel
composer create-project laravel/laravel forum-app
cd forum-app

# 2. Instalar Sanctum (autenticação por token)
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 3. Configurar .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=forum_db
DB_USERNAME=root
DB_PASSWORD=sua_senha

# 4. Rodar as migrations
php artisan migrate

# 5. Instalar React com Inertia (opcional) OU usar só a API
composer require inertiajs/inertia-laravel
npm install @inertiajs/react react react-dom
```

---

## 📁 Estrutura de Arquivos

```
database/migrations/
  ├── ..._create_users_table.php
  ├── ..._create_categories_table.php
  ├── ..._create_posts_table.php
  ├── ..._create_comments_table.php
  ├── ..._create_likes_table.php
  └── ..._create_tags_follows_notifications_reports.php

app/
  ├── Models/
  │   ├── User.php
  │   ├── Post.php
  │   ├── Comment.php
  │   ├── Like.php
  │   ├── Category.php
  │   └── Tag.php
  └── Http/Controllers/Api/
      ├── AuthController.php
      ├── PostController.php
      ├── CommentController.php
      ├── LikeController.php
      ├── CategoryController.php
      └── TagController.php

routes/
  └── api.php
```

---

## 🗄️ Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários com roles (user, moderator, admin) |
| `categories` | Categorias hierárquicas (suporta subcategorias) |
| `posts` | Threads do fórum com full-text search |
| `comments` | Comentários com replies aninhados |
| `likes` | Likes polimórficos (posts e comments) |
| `tags` | Tags com pivot `post_tag` |
| `post_follows` | Usuários seguindo posts |
| `notifications` | Notificações polimórficas |
| `reports` | Denúncias de conteúdo |

---

## 🔗 Endpoints da API

### Públicos
```
GET  /api/posts              # Lista posts (filtros: category, tag, search)
GET  /api/posts/{slug}       # Detalhe do post
GET  /api/posts/{id}/comments
GET  /api/categories
GET  /api/tags
POST /api/register
POST /api/login
```

### Autenticados (Bearer Token)
```
POST   /api/posts
PUT    /api/posts/{id}
DELETE /api/posts/{id}
POST   /api/posts/{id}/comments
PUT    /api/comments/{id}
DELETE /api/comments/{id}
POST   /api/likes/{type}/{id}   # type = post | comment
POST   /api/posts/{id}/follow
DELETE /api/posts/{id}/follow
```

### Moderação
```
PATCH /api/posts/{id}/pin
PATCH /api/posts/{id}/lock
PATCH /api/comments/{id}/hide
PATCH /api/comments/{id}/solution
```

---

## ⚙️ Destaques de Design

- **Likes polimórficos** — uma tabela serve para posts e comentários
- **Counter cache** — `likes_count`, `comments_count` e `views_count` direto na tabela para não precisar de COUNT() em queries
- **Full-text search** — índice MySQL nos campos `title` e `body` dos posts
- **Soft deletes** — posts e comentários deletados ficam ocultos mas não são removidos do banco
- **Nested comments** — `parent_id` permite respostas aninhadas
- **Categorias hierárquicas** — `parent_id` em categories para subcategorias
- **`last_activity_at`** — atualizado a cada novo comentário, permite ordenar por "mais recente atividade"

---

## 🚀 Próximos Passos

1. Criar `AuthController` com register/login usando Sanctum
2. Criar Policies (`PostPolicy`, `CommentPolicy`) para autorização
3. Criar Resources do Eloquent para formatar as respostas JSON
4. Configurar React com Inertia.js ou como SPA separada consumindo a API
5. Adicionar upload de avatar com `spatie/laravel-medialibrary`
6. Implementar notificações em tempo real com Laravel Echo + Pusher
