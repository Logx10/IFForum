<?php
// ============================================================
//  routes/api.php
// ============================================================

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

// ── Públicas ─────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/categories',          [CategoryController::class, 'index']);
Route::get('/categories/{slug}',   [CategoryController::class, 'show']);
Route::get('/tags',                [TagController::class, 'index']);

Route::get('/posts',               [PostController::class, 'index']);
Route::get('/posts/{slug}',        [PostController::class, 'show']);
Route::get('/posts/{id}/comments', [CommentController::class, 'index']);

// ── Autenticadas (Sanctum) ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Posts
    Route::post('/posts',              [PostController::class, 'store']);
    Route::put('/posts/{id}',          [PostController::class, 'update']);
    Route::delete('/posts/{id}',       [PostController::class, 'destroy']);

    // Comments
    Route::post('/posts/{id}/comments',    [CommentController::class, 'store']);
    Route::put('/comments/{id}',           [CommentController::class, 'update']);
    Route::delete('/comments/{id}',        [CommentController::class, 'destroy']);
    Route::patch('/comments/{id}/solution',[CommentController::class, 'markAsSolution']);

    // Likes (polimórfico: type = post | comment)
    Route::post('/likes/{type}/{id}',   [LikeController::class, 'toggle']);

    // Follow post
    Route::post('/posts/{id}/follow',   [PostController::class, 'follow']);
    Route::delete('/posts/{id}/follow', [PostController::class, 'unfollow']);

    // Admin / Moderador
    Route::middleware('can:moderate')->group(function () {
        Route::patch('/posts/{id}/pin',      [PostController::class, 'pin']);
        Route::patch('/posts/{id}/lock',     [PostController::class, 'lock']);
        Route::patch('/comments/{id}/hide',  [CommentController::class, 'hide']);
    });
});
