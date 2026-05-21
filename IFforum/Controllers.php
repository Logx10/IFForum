<?php
// ============================================================
//  app/Http/Controllers/Api/PostController.php
// ============================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::with(['author:id,name,username,avatar', 'category:id,name,slug,color', 'tags'])
            ->published()
            ->when($request->category, fn($q) => $q->whereHas('category', fn($q) => $q->where('slug', $request->category)))
            ->when($request->tag,      fn($q) => $q->whereHas('tags',     fn($q) => $q->where('slug', $request->tag)))
            ->when($request->search,   fn($q) => $q->whereFullText(['title', 'body'], $request->search))
            ->orderByDesc('is_pinned')
            ->orderByDesc('last_activity_at')
            ->paginate(15);

        return response()->json($posts);
    }

    public function show(string $slug)
    {
        $post = Post::with([
            'author:id,name,username,avatar,bio',
            'category',
            'tags',
        ])->where('slug', $slug)->firstOrFail();

        $post->increment('views_count');

        return response()->json($post);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|min:5|max:255',
            'body'        => 'required|string|min:20',
            'category_id' => 'required|exists:categories,id',
            'tags'        => 'array',
            'tags.*'      => 'exists:tags,id',
        ]);

        $post = $request->user()->posts()->create([
            ...$data,
            'slug'             => Str::slug($data['title']) . '-' . Str::random(6),
            'last_activity_at' => now(),
        ]);

        if (!empty($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return response()->json($post->load('author', 'category', 'tags'), 201);
    }

    public function update(Request $request, int $id)
    {
        $post = Post::findOrFail($id);
        $this->authorize('update', $post);

        $data = $request->validate([
            'title'       => 'sometimes|string|min:5|max:255',
            'body'        => 'sometimes|string|min:20',
            'category_id' => 'sometimes|exists:categories,id',
            'tags'        => 'array',
            'tags.*'      => 'exists:tags,id',
        ]);

        $post->update($data);

        if (isset($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return response()->json($post->load('author', 'category', 'tags'));
    }

    public function destroy(Request $request, int $id)
    {
        $post = Post::findOrFail($id);
        $this->authorize('delete', $post);
        $post->delete();
        return response()->json(['message' => 'Post removido.']);
    }

    public function follow(Request $request, int $id)
    {
        $request->user()->followedPosts()->syncWithoutDetaching([$id]);
        return response()->json(['following' => true]);
    }

    public function unfollow(Request $request, int $id)
    {
        $request->user()->followedPosts()->detach($id);
        return response()->json(['following' => false]);
    }

    public function pin(int $id)
    {
        $post = Post::findOrFail($id);
        $post->update(['is_pinned' => !$post->is_pinned]);
        return response()->json(['is_pinned' => $post->is_pinned]);
    }

    public function lock(int $id)
    {
        $post = Post::findOrFail($id);
        $newStatus = $post->status === 'locked' ? 'published' : 'locked';
        $post->update(['status' => $newStatus]);
        return response()->json(['status' => $newStatus]);
    }
}


// ============================================================
//  app/Http/Controllers/Api/LikeController.php
// ============================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Post, Comment, Like};
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
        $existing = $model->likes()->where('user_id', $user->id)->first();

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


// ============================================================
//  app/Http/Controllers/Api/CommentController.php
// ============================================================
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Comment, Post};
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(int $postId)
    {
        $comments = Comment::with(['author:id,name,username,avatar', 'replies.author:id,name,username,avatar'])
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->where('is_hidden', false)
            ->orderBy('is_solution', 'desc')
            ->orderBy('created_at')
            ->paginate(20);

        return response()->json($comments);
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
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        $post->increment('comments_count');
        $post->update(['last_activity_at' => now()]);

        return response()->json($comment->load('author'), 201);
    }

    public function update(Request $request, int $id)
    {
        $comment = Comment::findOrFail($id);
        $this->authorize('update', $comment);

        $comment->update($request->validate(['body' => 'required|string|min:3']));

        return response()->json($comment);
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

        // Remove solução anterior, se houver
        $comment->post->comments()->where('is_solution', true)->update(['is_solution' => false]);
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
