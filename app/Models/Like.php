<?php 

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