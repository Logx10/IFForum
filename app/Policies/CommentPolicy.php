<?php

// ============================================================
//  app/Policies/CommentPolicy.php
// ============================================================
namespace App\Policies;
 
use App\Models\{Comment, User};
use Illuminate\Auth\Access\HandlesAuthorization;
 
class CommentPolicy
{
    use HandlesAuthorization;
 
    public function before(User $user): ?bool
    {
        if ($user->isModerator()) return true;
        return null;
    }
 
    public function create(User $user): bool
    {
        return !$user->is_banned;
    }
 
    /** Só o autor pode editar o próprio comentário */
    public function update(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id;
    }
 
    /** Só o autor pode deletar */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id;
    }
}