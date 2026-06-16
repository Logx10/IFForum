<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;

// ── Home ─────────────────────────────────────────────────────────────────────
Route::get('/', function () {
    $sort  = request('sort', 'recent');
    $posts = Post::with(['author:id,name,username,avatar', 'category:id,name,slug,color,icon', 'tags'])
        ->published()
        ->when(request('category'), fn($q) => $q->whereHas('category', fn($q) => $q->where('slug', request('category'))))
        ->when(request('tag'),      fn($q) => $q->whereHas('tags',     fn($q) => $q->where('slug', request('tag'))))
        ->when(request('search'),   fn($q) => $q->whereFullText(['title', 'body'], request('search')))
        ->when($sort === 'popular',    fn($q) => $q->orderByDesc('likes_count'))
        ->when($sort === 'unanswered', fn($q) => $q->where('comments_count', 0)->orderByDesc('last_activity_at'))
        ->when($sort === 'recent' || !in_array($sort, ['popular','unanswered']),
            fn($q) => $q->orderByDesc('is_pinned')->orderByDesc('last_activity_at')
        )
        ->paginate(10)->withQueryString();

    // Marca quais posts o usuário logado já curtiu
    if (auth()->check()) {
        $userId    = auth()->id();
        $likedIds  = \App\Models\Like::where('user_id', $userId)
            ->where('likeable_type', \App\Models\Post::class)
            ->whereIn('likeable_id', $posts->pluck('id'))
            ->pluck('likeable_id')
            ->toArray();

        $posts->getCollection()->transform(function ($post) use ($likedIds) {
            $post->is_liked = in_array($post->id, $likedIds);
            return $post;
        });
    }

    $categories = Category::withCount('posts')
        ->whereNull('parent_id')
        ->where('is_active', true)
        ->orderBy('order')
        ->get();

    return Inertia::render('Home', compact('posts', 'categories'));
});

// ── Post individual ───────────────────────────────────────────────────────────
Route::get('/posts/{slug}', function (string $slug) {
    $post = Post::with(['author:id,name,username,avatar,bio', 'category', 'tags'])
        ->where('slug', $slug)
        ->firstOrFail();

    $post->increment('views_count');

    // Verifica se o usuário logado já curtiu este post
    $post->is_liked = auth()->check()
        ? $post->likes()->where('user_id', auth()->id())->exists()
        : false;

    $comments = Comment::with(['author:id,name,username,avatar', 'replies.author:id,name,username,avatar'])
        ->where('post_id', $post->id)
        ->whereNull('parent_id')
        ->where('is_hidden', false)
        ->orderByDesc('is_solution')
        ->orderBy('created_at')
        ->paginate(20);

    // Adiciona is_liked em cada comentário
    if (auth()->check()) {
        $userId = auth()->id();
        $comments->getCollection()->transform(function ($comment) use ($userId) {
            $comment->is_liked = $comment->likes()->where('user_id', $userId)->exists();
            $comment->replies->each(function ($reply) use ($userId) {
                $reply->is_liked = $reply->likes()->where('user_id', $userId)->exists();
            });
            return $comment;
        });
    }

    return Inertia::render('Post', compact('post', 'comments'));
});

// ── Login ─────────────────────────────────────────────────────────────────────
Route::get('/login', fn() => Inertia::render('Login'))->name('login');

Route::post('/login', function () {
    $data = request()->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    if (!auth()->attempt($data)) {
        return back()->withErrors(['email' => 'Credenciais incorretas.']);
    }

    request()->session()->regenerate();
    return redirect('/');
});

// ── Register ──────────────────────────────────────────────────────────────────
Route::get('/register', fn() => Inertia::render('Register'))->name('register');

Route::post('/register', function () {
    $data = request()->validate([
        'name'     => 'required|string|max:100',
        'username' => 'required|string|max:30|unique:users|alpha_dash',
        'email'    => 'required|email|unique:users',
        'password' => 'required|confirmed|min:8',
    ]);

    $user = \App\Models\User::create($data);
    auth()->login($user);
    return redirect('/');
});

// ── Logout ────────────────────────────────────────────────────────────────────
Route::post('/logout', function () {
    auth()->logout();
    request()->session()->invalidate();
    return redirect('/');
})->name('logout');

// ── Perfil ────────────────────────────────────────────────────────────────────
Route::get('/perfil/{username}', function (string $username) {
    $user = User::where('username', $username)->firstOrFail();

    $posts = Post::with(['category:id,name,slug,color,icon', 'tags'])
        ->where('user_id', $user->id)
        ->published()
        ->orderByDesc('last_activity_at')
        ->paginate(10);

    $stats = [
        'posts_count'    => Post::where('user_id', $user->id)->count(),
        'comments_count' => Comment::where('user_id', $user->id)->count(),
        'liked_count'    => 0,
    ];

    return Inertia::render('Profile', compact('user', 'posts', 'stats'));
});

// ── Criar post ────────────────────────────────────────────────────────────────
Route::post('/posts', function () {
    abort_unless(auth()->check(), 401, 'Você precisa estar logado.');

    $data = request()->validate([
        'title'       => 'required|string|min:5|max:255',
        'body'        => 'required|string|min:20',
        'category_id' => 'required|exists:categories,id',
    ]);

    $post = auth()->user()->posts()->create([
        'title'            => $data['title'],
        'body'             => $data['body'],
        'category_id'      => $data['category_id'],
        'slug'             => \Illuminate\Support\Str::slug($data['title']) . '-' . \Illuminate\Support\Str::random(6),
        'status'           => 'published',
        'last_activity_at' => now(),
    ]);

    return redirect('/posts/' . $post->slug);
})->name('posts.store');

// ── Comentar ──────────────────────────────────────────────────────────────────
Route::post('/posts/{id}/comments', function (int $id) {
    abort_unless(auth()->check(), 401);

    $post = Post::findOrFail($id);
    abort_if($post->status === 'locked', 403, 'Post bloqueado.');

    $data = request()->validate([
        'body'      => 'required|string|min:3',
        'parent_id' => 'nullable|exists:comments,id',
    ]);

    $post->comments()->create([
        'body'      => $data['body'],
        'parent_id' => $data['parent_id'] ?? null,
        'user_id'   => auth()->id(),
    ]);

    $post->increment('comments_count');
    $post->update(['last_activity_at' => now()]);

    return back();
});

// ── Likes (web — autenticado) ─────────────────────────────────────────────────
// type = post | comment
Route::post('/likes/{type}/{id}', function (string $type, int $id) {
    abort_unless(auth()->check(), 401, 'Faça login para curtir.');

    $model = match ($type) {
        'post'    => \App\Models\Post::findOrFail($id),
        'comment' => \App\Models\Comment::findOrFail($id),
        default   => abort(422, 'Tipo inválido.'),
    };

    $user     = auth()->user();
    $existing = $model->likes()->where('user_id', $user->id)->first();

    if ($existing) {
        $existing->delete();
        $model->decrement('likes_count');
        return response()->json([
            'liked'       => false,
            'likes_count' => $model->likes_count,
        ]);
    }

    $model->likes()->create(['user_id' => $user->id, 'type' => 'like']);
    $model->increment('likes_count');

    return response()->json([
        'liked'       => true,
        'likes_count' => $model->likes_count,
    ]);
})->name('likes.toggle');

// ── Editar post ───────────────────────────────────────────────────────────────
Route::put('/posts/{id}', function (int $id) {
    abort_unless(auth()->check(), 401);

    $post = \App\Models\Post::findOrFail($id);

    // Só o autor ou moderador pode editar
    if (auth()->id() !== $post->user_id && !auth()->user()->isModerator()) {
        abort(403, 'Sem permissão para editar este post.');
    }

    // Post bloqueado não pode ser editado (exceto por moderador)
    if ($post->status === 'locked' && !auth()->user()->isModerator()) {
        abort(403, 'Post bloqueado não pode ser editado.');
    }

    $data = request()->validate([
        'title' => 'required|string|min:5|max:255',
        'body'  => 'required|string|min:20',
    ]);

    $post->update($data);

    return response()->json([
        'id'    => $post->id,
        'title' => $post->title,
        'body'  => $post->body,
    ]);
})->name('posts.update');

// ── Deletar post ──────────────────────────────────────────────────────────────
Route::delete('/posts/{id}', function (int $id) {
    abort_unless(auth()->check(), 401);

    $post = \App\Models\Post::findOrFail($id);

    if (auth()->id() !== $post->user_id && !auth()->user()->isModerator()) {
        abort(403, 'Sem permissão para deletar este post.');
    }

    $post->delete();

    return response()->json(['deleted' => true]);
})->name('posts.destroy');

// ── Editar comentário ─────────────────────────────────────────────────────────
Route::put('/comments/{id}', function (int $id) {
    abort_unless(auth()->check(), 401);

    $comment = \App\Models\Comment::findOrFail($id);

    if (auth()->id() !== $comment->user_id && !auth()->user()->isModerator()) {
        abort(403, 'Sem permissão para editar este comentário.');
    }

    $data = request()->validate([
        'body' => 'required|string|min:3',
    ]);

    $comment->update($data);

    return response()->json([
        'id'   => $comment->id,
        'body' => $comment->body,
    ]);
})->name('comments.update');

// ── Deletar comentário ────────────────────────────────────────────────────────
Route::delete('/comments/{id}', function (int $id) {
    abort_unless(auth()->check(), 401);

    $comment = \App\Models\Comment::findOrFail($id);

    if (auth()->id() !== $comment->user_id && !auth()->user()->isModerator()) {
        abort(403, 'Sem permissão para deletar este comentário.');
    }

    $comment->post->decrement('comments_count');
    $comment->delete();

    return response()->json(['deleted' => true]);
})->name('comments.destroy');

// ── Página de edição de perfil ────────────────────────────────────────────────
Route::get('/perfil/{username}/editar', function (string $username) {
    abort_unless(auth()->check(), 401);
    $user = \App\Models\User::where('username', $username)->firstOrFail();

    // Só o próprio usuário pode editar seu perfil
    abort_unless(auth()->id() === $user->id, 403, 'Você não pode editar o perfil de outro usuário.');

    return Inertia::render('EditProfile', ['user' => $user]);
})->name('profile.edit');

// ── Salvar dados do perfil (nome, bio) ────────────────────────────────────────
Route::put('/perfil/{username}', function (string $username) {
    abort_unless(auth()->check(), 401);
    $user = \App\Models\User::where('username', $username)->firstOrFail();
    abort_unless(auth()->id() === $user->id, 403);

    $data = request()->validate([
        'name' => 'required|string|max:100',
        'bio'  => 'nullable|string|max:300',
    ]);

    $user->update($data);

    return response()->json([
        'name' => $user->name,
        'bio'  => $user->bio,
        'message' => 'Perfil atualizado com sucesso!',
    ]);
})->name('profile.update');

// ── Salvar avatar (URL) ───────────────────────────────────────────────────────
Route::put('/perfil/{username}/avatar', function (string $username) {
    abort_unless(auth()->check(), 401);
    $user = \App\Models\User::where('username', $username)->firstOrFail();
    abort_unless(auth()->id() === $user->id, 403);

    $data = request()->validate([
        'avatar' => 'nullable|url|max:500',
    ]);

    $user->update(['avatar' => $data['avatar'] ?: null]);

    return response()->json([
        'avatar'  => $user->avatar,
        'message' => 'Foto atualizada com sucesso!',
    ]);
})->name('profile.avatar');

// ── Alterar senha ─────────────────────────────────────────────────────────────
Route::put('/perfil/{username}/senha', function (string $username) {
    abort_unless(auth()->check(), 401);
    $user = \App\Models\User::where('username', $username)->firstOrFail();
    abort_unless(auth()->id() === $user->id, 403);

    $data = request()->validate([
        'current_password'      => 'required|string',
        'password'              => 'required|string|min:8|confirmed',
        'password_confirmation' => 'required|string',
    ]);

    if (!\Illuminate\Support\Facades\Hash::check($data['current_password'], $user->password)) {
        return response()->json([
            'errors' => ['current_password' => ['Senha atual incorreta.']]
        ], 422);
    }

    $user->update(['password' => $data['password']]);

    return response()->json(['message' => 'Senha alterada com sucesso!']);
})->name('profile.password');

// ── Busca e ordenação já tratadas na rota GET / via when() ────────────────────
// ?search=texto  → full-text nos posts
// ?sort=popular  → ordena por likes_count desc
// ?sort=unanswered → filtra posts com comments_count = 0
// Nenhuma rota nova necessária — apenas atualizar a lógica da rota /
