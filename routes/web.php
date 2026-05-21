<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Post;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;

// ── Home ─────────────────────────────────────────────────────────────────────
Route::get('/', function () {
    $posts = Post::with(['author:id,name,username,avatar', 'category:id,name,slug,color,icon', 'tags'])
        ->published()
        ->when(request('category'), fn($q) => $q->whereHas('category', fn($q) => $q->where('slug', request('category'))))
        ->when(request('search'),   fn($q) => $q->whereFullText(['title', 'body'], request('search')))
        ->orderByDesc('is_pinned')
        ->orderByDesc('last_activity_at')
        ->paginate(10)->withQueryString();

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

    $comments = Comment::with(['author:id,name,username,avatar', 'replies.author:id,name,username,avatar'])
        ->where('post_id', $post->id)
        ->whereNull('parent_id')
        ->where('is_hidden', false)
        ->orderByDesc('is_solution')
        ->orderBy('created_at')
        ->paginate(20);

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
