<?php
// ============================================================
//  app/Models/User.php
// ============================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = ['name', 'username', 'email', 'password', 'avatar', 'bio', 'role'];
    protected $hidden   = ['password', 'remember_token'];
    protected $casts    = ['email_verified_at' => 'datetime', 'password' => 'hashed'];

    public function posts()    { return $this->hasMany(Post::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function likes()    { return $this->hasMany(Like::class); }

    public function followedPosts()
    {
        return $this->belongsToMany(Post::class, 'post_follows');
    }

    public function isAdmin()       { return $this->role === 'admin'; }
    public function isModerator()   { return in_array($this->role, ['admin', 'moderator']); }
}


// ============================================================
//  app/Models/Category.php
// ============================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'color', 'parent_id', 'order', 'is_active'];

    public function parent()   { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children() { return $this->hasMany(Category::class, 'parent_id'); }
    public function posts()    { return $this->hasMany(Post::class); }
}


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


// ============================================================
//  app/Models/Like.php
// ============================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'type'];
    protected $casts    = ['created_at' => 'datetime'];

    public function user()      { return $this->belongsTo(User::class); }
    public function likeable()  { return $this->morphTo(); }
}


// ============================================================
//  app/Models/Tag.php
// ============================================================
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = ['name', 'slug', 'color'];
    public function posts() { return $this->belongsToMany(Post::class); }
}
