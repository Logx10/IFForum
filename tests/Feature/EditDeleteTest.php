<?php

namespace Tests\Feature;

use App\Models\{User, Post, Comment, Category};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditDeleteTest extends TestCase
{
    use RefreshDatabase;

    private User     $user;
    private User     $other;
    private User     $moderator;
    private Post     $post;
    private Comment  $comment;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user      = User::factory()->create(['role' => 'user']);
        $this->other     = User::factory()->create(['role' => 'user']);
        $this->moderator = User::factory()->create(['role' => 'moderator']);
        $this->category  = Category::factory()->create();

        $this->post = Post::factory()->create([
            'user_id'     => $this->user->id,
            'category_id' => $this->category->id,
            'status'      => 'published',
        ]);

        $this->comment = Comment::factory()->create([
            'user_id' => $this->user->id,
            'post_id' => $this->post->id,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Editar Post
    // ══════════════════════════════════════════════════════════════════════════

    public function test_author_can_edit_own_post(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Título editado com mais de cinco caracteres',
            'body'  => 'Conteúdo editado com mais de vinte caracteres aqui.',
        ])->assertOk()
          ->assertJson([
              'title' => 'Título editado com mais de cinco caracteres',
              'body'  => 'Conteúdo editado com mais de vinte caracteres aqui.',
          ]);

        $this->assertDatabaseHas('posts', [
            'id'    => $this->post->id,
            'title' => 'Título editado com mais de cinco caracteres',
        ]);
    }

    public function test_edit_post_response_has_correct_fields(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Novo título com mais de cinco chars',
            'body'  => 'Novo conteúdo com mais de vinte caracteres aqui.',
        ])->assertJsonStructure(['id', 'title', 'body']);
    }

    public function test_other_user_cannot_edit_post(): void
    {
        $this->actingAs($this->other);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Tentativa de edição por outro usuário',
            'body'  => 'Conteúdo da tentativa com mais de vinte chars.',
        ])->assertForbidden();

        $this->assertDatabaseMissing('posts', ['title' => 'Tentativa de edição por outro usuário']);
    }

    public function test_guest_cannot_edit_post(): void
    {
        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Tentativa de visitante',
            'body'  => 'Conteúdo do visitante com mais de vinte chars.',
        ])->assertUnauthorized();
    }

    public function test_moderator_can_edit_any_post(): void
    {
        $this->actingAs($this->moderator);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Editado pelo moderador aqui',
            'body'  => 'Conteúdo editado pelo moderador com mais de vinte chars.',
        ])->assertOk();

        $this->assertDatabaseHas('posts', [
            'id'    => $this->post->id,
            'title' => 'Editado pelo moderador aqui',
        ]);
    }

    public function test_edit_post_fails_with_short_title(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Hi',
            'body'  => 'Conteúdo válido com mais de vinte caracteres.',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('title');
    }

    public function test_edit_post_fails_with_short_body(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Título válido aqui',
            'body'  => 'Curto',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('body');
    }

    public function test_author_cannot_edit_locked_post(): void
    {
        $this->post->update(['status' => 'locked']);
        $this->actingAs($this->user);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Tentativa em post bloqueado aqui',
            'body'  => 'Conteúdo da tentativa com mais de vinte chars.',
        ])->assertForbidden();
    }

    public function test_moderator_can_edit_locked_post(): void
    {
        $this->post->update(['status' => 'locked']);
        $this->actingAs($this->moderator);

        $this->putJson("/posts/{$this->post->id}", [
            'title' => 'Moderador edita post bloqueado',
            'body'  => 'Conteúdo editado pelo moderador com mais de vinte chars.',
        ])->assertOk();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Deletar Post
    // ══════════════════════════════════════════════════════════════════════════

    public function test_author_can_delete_own_post(): void
    {
        $this->actingAs($this->user);

        $this->deleteJson("/posts/{$this->post->id}")
             ->assertOk()
             ->assertJson(['deleted' => true]);

        $this->assertSoftDeleted('posts', ['id' => $this->post->id]);
    }

    public function test_other_user_cannot_delete_post(): void
    {
        $this->actingAs($this->other);

        $this->deleteJson("/posts/{$this->post->id}")->assertForbidden();

        $this->assertDatabaseHas('posts', ['id' => $this->post->id, 'deleted_at' => null]);
    }

    public function test_guest_cannot_delete_post(): void
    {
        $this->deleteJson("/posts/{$this->post->id}")->assertUnauthorized();
    }

    public function test_moderator_can_delete_any_post(): void
    {
        $this->actingAs($this->moderator);

        $this->deleteJson("/posts/{$this->post->id}")->assertOk();

        $this->assertSoftDeleted('posts', ['id' => $this->post->id]);
    }

    public function test_delete_nonexistent_post_returns_404(): void
    {
        $this->actingAs($this->user);

        $this->deleteJson("/posts/99999")->assertNotFound();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Editar Comentário
    // ══════════════════════════════════════════════════════════════════════════

    public function test_author_can_edit_own_comment(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/comments/{$this->comment->id}", [
            'body' => 'Comentário editado com mais de três caracteres.',
        ])->assertOk()
          ->assertJson(['body' => 'Comentário editado com mais de três caracteres.']);

        $this->assertDatabaseHas('comments', [
            'id'   => $this->comment->id,
            'body' => 'Comentário editado com mais de três caracteres.',
        ]);
    }

    public function test_edit_comment_response_has_correct_fields(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/comments/{$this->comment->id}", [
            'body' => 'Comentário editado válido aqui.',
        ])->assertJsonStructure(['id', 'body']);
    }

    public function test_other_user_cannot_edit_comment(): void
    {
        $this->actingAs($this->other);

        $this->putJson("/comments/{$this->comment->id}", [
            'body' => 'Tentativa de edição por outro usuário.',
        ])->assertForbidden();
    }

    public function test_guest_cannot_edit_comment(): void
    {
        $this->putJson("/comments/{$this->comment->id}", [
            'body' => 'Tentativa de visitante editar comentário.',
        ])->assertUnauthorized();
    }

    public function test_moderator_can_edit_any_comment(): void
    {
        $this->actingAs($this->moderator);

        $this->putJson("/comments/{$this->comment->id}", [
            'body' => 'Editado pelo moderador com sucesso.',
        ])->assertOk();

        $this->assertDatabaseHas('comments', [
            'id'   => $this->comment->id,
            'body' => 'Editado pelo moderador com sucesso.',
        ]);
    }

    public function test_edit_comment_fails_with_short_body(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/comments/{$this->comment->id}", [
            'body' => 'Oi',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('body');
    }

    public function test_edit_nonexistent_comment_returns_404(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/comments/99999", ['body' => 'Comentário válido aqui.'])
             ->assertNotFound();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Deletar Comentário
    // ══════════════════════════════════════════════════════════════════════════

    public function test_author_can_delete_own_comment(): void
    {
        $this->actingAs($this->user);

        $this->deleteJson("/comments/{$this->comment->id}")
             ->assertOk()
             ->assertJson(['deleted' => true]);

        $this->assertSoftDeleted('comments', ['id' => $this->comment->id]);
    }

    public function test_delete_comment_decrements_post_comments_count(): void
    {
        $this->post->update(['comments_count' => 1]);
        $this->actingAs($this->user);

        $this->deleteJson("/comments/{$this->comment->id}");

        $this->assertDatabaseHas('posts', [
            'id'             => $this->post->id,
            'comments_count' => 0,
        ]);
    }

    public function test_other_user_cannot_delete_comment(): void
    {
        $this->actingAs($this->other);

        $this->deleteJson("/comments/{$this->comment->id}")->assertForbidden();

        $this->assertDatabaseHas('comments', ['id' => $this->comment->id, 'deleted_at' => null]);
    }

    public function test_guest_cannot_delete_comment(): void
    {
        $this->deleteJson("/comments/{$this->comment->id}")->assertUnauthorized();
    }

    public function test_moderator_can_delete_any_comment(): void
    {
        $this->actingAs($this->moderator);

        $this->deleteJson("/comments/{$this->comment->id}")->assertOk();

        $this->assertSoftDeleted('comments', ['id' => $this->comment->id]);
    }

    public function test_delete_nonexistent_comment_returns_404(): void
    {
        $this->actingAs($this->user);

        $this->deleteJson("/comments/99999")->assertNotFound();
    }
}
