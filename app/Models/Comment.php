<?php

// ============================================================
//  app/Models/Comment.php
// ============================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['body', 'user_id', 'post_id', 'parent_id', 'is_solution'];
    protected $casts    = ['is_solution' => 'boolean', 'is_hidden' => 'boolean'];

    public function author()  { return $this->belongsTo(User::class, 'user_id'); }
    public function post()    { return $this->belongsTo(Post::class); }
    public function parent()  { return $this->belongsTo(Comment::class, 'parent_id'); }
    public function replies() { return $this->hasMany(Comment::class, 'parent_id'); }
    public function likes()   { return $this->morphMany(Like::class, 'likeable'); }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }
}