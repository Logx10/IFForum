<?php
// ============================================================
//  app/Policies/PostPolicy.php
// ============================================================
namespace App\Policies;
 
use App\Models\{Post, User};
use Illuminate\Auth\Access\HandlesAuthorization;
 
class PostPolicy
{
    use HandlesAuthorization;
 
    /** Admin e moderador podem fazer tudo */
    public function before(User $user): ?bool
    {
        if ($user->isModerator()) return true;
        return null; // deixa as regras abaixo decidirem
    }
 
    /** Qualquer usuário autenticado pode criar */
    public function create(User $user): bool
    {
        return !$user->is_banned;
    }
 
    /** Só o autor pode editar, e o post não pode estar bloqueado */
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id
            && $post->status !== 'locked';
    }
 
    /** Só o autor pode deletar */
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
 
    /** Só moderadores (tratado no `before`) */
    public function moderate(User $user): bool
    {
        return false;
    }
}