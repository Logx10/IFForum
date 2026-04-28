<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(int $postId)
    {
        $comments = Comment::with(['author:id,name,username,avatar', 'replies.author:id,name,username,avatar'])
            ->where('post_id', '=', $postId)
            ->whereNull('parent_id')
            ->where('is_hidden', '=', false)
            ->orderBy('is_solution', 'desc')
            ->orderBy('created_at')
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    public function store(Request $request, int $postId)
    {
        $post = Post::findOrFail($postId);

        abort_if($post->status === 'locked', 403, 'Post bloqueado para novos comentários.');

        $data = $request->validate([
            'body'      => 'required|string|min:3',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = $post->comments()->create([
            'body'      => $data['body'],
            'parent_id' => $data['parent_id'] ?? null,
            'user_id'   => $request->user()->id,
        ]);

        $post->increment('comments_count');
        $post->update(['last_activity_at' => now()]);

        return new CommentResource($comment->load('author'));
    }

    public function update(Request $request, int $id)
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('update', $comment);

        $comment->update($request->validate(['body' => 'required|string|min:3']));

        return new CommentResource($comment);
    }

    public function destroy(Request $request, int $id)
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('delete', $comment);

        $comment->delete();
        $comment->post->decrement('comments_count');

        return response()->json(['message' => 'Comentário removido.']);
    }

    public function markAsSolution(Request $request, int $id)
    {
        $comment = Comment::with('post')->findOrFail($id);
        $this->authorize('update', $comment->post);

        $comment->post->comments()->where('is_solution', '=', true)->update(['is_solution' => false]);
        $comment->update(['is_solution' => true]);

        return response()->json(['is_solution' => true]);
    }

    public function hide(int $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['is_hidden' => !$comment->is_hidden]);
        return response()->json(['is_hidden' => $comment->is_hidden]);
    }
}
