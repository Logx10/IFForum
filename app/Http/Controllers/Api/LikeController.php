<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, string $type, int $id)
    {
        $model = match ($type) {
            'post'    => Post::findOrFail($id),
            'comment' => Comment::findOrFail($id),
            default   => abort(422, 'Tipo inválido.'),
        };

        $user     = $request->user();
        $existing = $model->likes()->where('user_id', '=', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $model->decrement('likes_count');
            return response()->json(['liked' => false, 'likes_count' => $model->likes_count]);
        }

        $model->likes()->create(['user_id' => $user->id, 'type' => 'like']);
        $model->increment('likes_count');

        return response()->json(['liked' => true, 'likes_count' => $model->likes_count]);
    }
}
