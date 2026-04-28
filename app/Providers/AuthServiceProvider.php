<?php

// ============================================================
//  app/Providers/AuthServiceProvider.php  (registrar as policies)
// ============================================================
namespace App\Providers;
 
use App\Models\{Post, Comment};
use App\Policies\{PostPolicy, CommentPolicy};
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
 
class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Post::class    => PostPolicy::class,
        Comment::class => CommentPolicy::class,
    ];
 
    public function boot(): void
    {
        $this->registerPolicies();
 
        // Gate para moderação (usado em routes/api.php com middleware('can:moderate'))
        \Illuminate\Support\Facades\Gate::define('moderate', function ($user) {
            return $user->isModerator();
        });
    }
}