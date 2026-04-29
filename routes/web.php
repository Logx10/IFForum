<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Post;
use App\Models\Category;

Route::get('/', function () {
    $posts = Post::with(['author:id,name,username,avatar', 'category:id,name,slug,color,icon', 'tags'])
        ->published()
        ->orderByDesc('is_pinned')
        ->orderByDesc('last_activity_at')
        ->paginate(10);

    $categories = Category::withCount('posts')
        ->whereNull('parent_id')
        ->where('is_active', true)
        ->orderBy('order')
        ->get();

    return Inertia::render('Home', [
        'posts'      => $posts,
        'categories' => $categories,
    ]);
});