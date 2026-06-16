<?php

namespace Tests\Feature;

use App\Models\{User, Post, Comment, Category, Like};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testa os likes via rota web (/likes/{type}/{id})
 * — a rota usada pelo frontend React via fetch()
 */
class LikeWebTest extends TestCase
{
    use RefreshDatabase;

    private User     $user;
    private Post     $post;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user     = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->post     = Post::factory()->create([
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'published',
            'likes_count' => 0,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Autenticação
    // ══════════════════════════════════════════════════════════════════════════

    public function test_guest_cannot_like_post(): void
    {
        $this->postJson("/likes/post/{$this->post->id}")
             ->assertUnauthorized();

        $this->assertDatabaseMissing('likes', ['likeable_id' => $this->post->id]);
        $this->assertDatabaseHas('posts', ['id' => $this->post->id, 'likes_count' => 0]);
    }

    public function test_guest_cannot_like_comment(): void
    {
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
        ]);

        $this->postJson("/likes/comment/{$comment->id}")
             ->assertUnauthorized();

        $this->assertDatabaseMissing('likes', ['likeable_id' => $comment->id]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Curtir post
    // ══════════════════════════════════════════════════════════════════════════

    public function test_authenticated_user_can_like_post(): void
    {
        $this->actingAs($this->user);

        $response = $this->postJson("/likes/post/{$this->post->id}");

        $response->assertOk()
                 ->assertJson(['liked' => true, 'likes_count' => 1]);

        $this->assertDatabaseHas('likes', [
            'user_id'       => $this->user->id,
            'likeable_id'   => $this->post->id,
            'likeable_type' => \App\Models\Post::class,
            'type'          => 'like',
        ]);

        $this->assertDatabaseHas('posts', [
            'id'          => $this->post->id,
            'likes_count' => 1,
        ]);
    }

    public function test_like_post_returns_correct_json_structure(): void
    {
        $this->actingAs($this->user);

        $this->postJson("/likes/post/{$this->post->id}")
             ->assertJsonStructure(['liked', 'likes_count'])
             ->assertJson(['liked' => true]);
    }

    public function test_liking_post_twice_removes_the_like(): void
    {
        $this->actingAs($this->user);

        // Curtir
        $this->postJson("/likes/post/{$this->post->id}")
             ->assertJson(['liked' => true, 'likes_count' => 1]);

        // Descurtir
        $this->postJson("/likes/post/{$this->post->id}")
             ->assertJson(['liked' => false, 'likes_count' => 0]);

        $this->assertDatabaseMissing('likes', [
            'user_id'     => $this->user->id,
            'likeable_id' => $this->post->id,
        ]);

        $this->assertDatabaseHas('posts', [
            'id'          => $this->post->id,
            'likes_count' => 0,
        ]);
    }

    public function test_multiple_users_can_like_same_post(): void
    {
        $userA = $this->user;
        $userB = User::factory()->create();
        $userC = User::factory()->create();

        $this->actingAs($userA)->postJson("/likes/post/{$this->post->id}");
        $this->actingAs($userB)->postJson("/likes/post/{$this->post->id}");
        $this->actingAs($userC)->postJson("/likes/post/{$this->post->id}");

        $this->assertDatabaseHas('posts', [
            'id'          => $this->post->id,
            'likes_count' => 3,
        ]);

        $this->assertEquals(3, Like::where('likeable_id', $this->post->id)
            ->where('likeable_type', \App\Models\Post::class)
            ->count());
    }

    public function test_like_counter_never_goes_below_zero(): void
    {
        $this->actingAs($this->user);

        // Descurtir sem ter curtido antes — não deve existir like para remover
        $this->postJson("/likes/post/{$this->post->id}"); // like   → 1
        $this->postJson("/likes/post/{$this->post->id}"); // unlike → 0
        $this->postJson("/likes/post/{$this->post->id}"); // like   → 1
        $this->postJson("/likes/post/{$this->post->id}"); // unlike → 0

        $this->assertDatabaseHas('posts', [
            'id'          => $this->post->id,
            'likes_count' => 0,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Curtir comentário
    // ══════════════════════════════════════════════════════════════════════════

    public function test_authenticated_user_can_like_comment(): void
    {
        $this->actingAs($this->user);
        $comment = Comment::factory()->create([
            'post_id'     => $this->post->id,
            'user_id'     => $this->user->id,
            'likes_count' => 0,
        ]);

        $this->postJson("/likes/comment/{$comment->id}")
             ->assertOk()
             ->assertJson(['liked' => true, 'likes_count' => 1]);

        $this->assertDatabaseHas('likes', [
            'user_id'       => $this->user->id,
            'likeable_id'   => $comment->id,
            'likeable_type' => \App\Models\Comment::class,
        ]);

        $this->assertDatabaseHas('comments', [
            'id'          => $comment->id,
            'likes_count' => 1,
        ]);
    }

    public function test_liking_comment_twice_removes_the_like(): void
    {
        $this->actingAs($this->user);
        $comment = Comment::factory()->create([
            'post_id'     => $this->post->id,
            'user_id'     => $this->user->id,
            'likes_count' => 0,
        ]);

        $this->postJson("/likes/comment/{$comment->id}")
             ->assertJson(['liked' => true, 'likes_count' => 1]);

        $this->postJson("/likes/comment/{$comment->id}")
             ->assertJson(['liked' => false, 'likes_count' => 0]);

        $this->assertDatabaseMissing('likes', [
            'user_id'     => $this->user->id,
            'likeable_id' => $comment->id,
        ]);
    }

    public function test_user_can_like_own_post(): void
    {
        $this->actingAs($this->user);

        // Deve poder curtir o próprio post
        $this->postJson("/likes/post/{$this->post->id}")
             ->assertOk()
             ->assertJson(['liked' => true]);
    }

    public function test_user_can_like_own_comment(): void
    {
        $this->actingAs($this->user);
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
        ]);

        $this->postJson("/likes/comment/{$comment->id}")
             ->assertOk()
             ->assertJson(['liked' => true]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Tipo inválido
    // ══════════════════════════════════════════════════════════════════════════

    public function test_invalid_like_type_returns_422(): void
    {
        $this->actingAs($this->user);

        $this->postJson("/likes/invalid/1")
             ->assertUnprocessable();
    }

    public function test_like_nonexistent_post_returns_404(): void
    {
        $this->actingAs($this->user);

        $this->postJson("/likes/post/99999")
             ->assertNotFound();
    }

    public function test_like_nonexistent_comment_returns_404(): void
    {
        $this->actingAs($this->user);

        $this->postJson("/likes/comment/99999")
             ->assertNotFound();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // is_liked na listagem (home)
    // ══════════════════════════════════════════════════════════════════════════

    public function test_home_marks_liked_posts_for_authenticated_user(): void
    {
        // Usuário curte o post
        Like::create([
            'user_id'       => $this->user->id,
            'likeable_id'   => $this->post->id,
            'likeable_type' => \App\Models\Post::class,
            'type'          => 'like',
        ]);

        $this->actingAs($this->user);

        $this->get('/')
             ->assertInertia(fn($page) =>
                 $page->where('posts.data.0.is_liked', true)
             );
    }

    public function test_home_marks_posts_as_not_liked_for_guests(): void
    {
        $this->get('/')
             ->assertInertia(fn($page) =>
                 $page->where('posts.data.0.is_liked', false)
             );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // is_liked na página do post
    // ══════════════════════════════════════════════════════════════════════════

    public function test_post_page_shows_is_liked_true_when_user_liked(): void
    {
        Like::create([
            'user_id'       => $this->user->id,
            'likeable_id'   => $this->post->id,
            'likeable_type' => \App\Models\Post::class,
            'type'          => 'like',
        ]);

        $this->actingAs($this->user);

        $this->get("/posts/{$this->post->slug}")
             ->assertInertia(fn($page) =>
                 $page->where('post.is_liked', true)
             );
    }

    public function test_post_page_shows_is_liked_false_for_guest(): void
    {
        $this->get("/posts/{$this->post->slug}")
             ->assertInertia(fn($page) =>
                 $page->where('post.is_liked', false)
             );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Unicidade no banco
    // ══════════════════════════════════════════════════════════════════════════

    public function test_database_has_unique_constraint_per_user_per_item(): void
    {
        $this->actingAs($this->user);

        // Garante que só um registro existe após toggle
        $this->postJson("/likes/post/{$this->post->id}"); // cria
        $this->postJson("/likes/post/{$this->post->id}"); // remove
        $this->postJson("/likes/post/{$this->post->id}"); // cria

        $count = Like::where('user_id', $this->user->id)
            ->where('likeable_id', $this->post->id)
            ->where('likeable_type', \App\Models\Post::class)
            ->count();

        $this->assertEquals(1, $count);
    }
}
