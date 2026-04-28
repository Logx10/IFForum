<?php 

// ============================================================
//  app/Models/Post.php
// ============================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'body', 'user_id', 'category_id',
        'status', 'is_pinned', 'is_featured', 'last_activity_at',
    ];
    protected $casts = ['is_pinned' => 'boolean', 'is_featured' => 'boolean', 'last_activity_at' => 'datetime'];

    public function author()   { return $this->belongsTo(User::class, 'user_id'); }
    public function category() { return $this->belongsTo(Category::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function tags()     { return $this->belongsToMany(Tag::class); }
    public function likes()    { return $this->morphMany(Like::class, 'likeable'); }
    public function followers(){ return $this->belongsToMany(User::class, 'post_follows'); }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function scopePublished($q)  { return $q->where('status', 'published'); }
    public function scopePinned($q)     { return $q->where('is_pinned', true); }
}