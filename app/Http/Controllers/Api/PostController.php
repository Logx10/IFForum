<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostCollection;
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

        return new PostCollection($posts);
    }

    public function show(string $slug)
    {
        $post = Post::with([
            'author:id,name,username,avatar,bio',
            'category',
            'tags',
        ])->where('slug', '=', $slug)->firstOrFail();

        $post->increment('views_count');

        return new PostResource($post);
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
            'title'            => $data['title'],
            'body'             => $data['body'],
            'category_id'      => $data['category_id'],
            'slug'             => Str::slug($data['title']) . '-' . Str::random(6),
            'last_activity_at' => now(),
        ]);

        if (!empty($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return new PostResource($post->load('author', 'category', 'tags'));
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

        return new PostResource($post->load('author', 'category', 'tags'));
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
