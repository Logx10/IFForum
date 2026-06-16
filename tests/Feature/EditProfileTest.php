<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EditProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $other;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user  = User::factory()->create(['password' => Hash::make('SenhaAtual123')]);
        $this->other = User::factory()->create();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Página de edição
    // ══════════════════════════════════════════════════════════════════════════

    public function test_owner_can_access_edit_profile_page(): void
    {
        $this->actingAs($this->user)
             ->get("/perfil/{$this->user->username}/editar")
             ->assertOk()
             ->assertInertia(fn($page) =>
                 $page->component('EditProfile')
                      ->where('user.username', $this->user->username)
             );
    }

    public function test_guest_cannot_access_edit_profile_page(): void
    {
        $this->get("/perfil/{$this->user->username}/editar")
             ->assertUnauthorized();
    }

    public function test_other_user_cannot_access_edit_profile_page(): void
    {
        $this->actingAs($this->other)
             ->get("/perfil/{$this->user->username}/editar")
             ->assertForbidden();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Dados pessoais (nome + bio)
    // ══════════════════════════════════════════════════════════════════════════

    public function test_user_can_update_name_and_bio(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}", [
            'name' => 'João Silva Atualizado',
            'bio'  => 'Estudante de TI no IFCE Campus Tianguá.',
        ])->assertOk()
          ->assertJson([
              'name'    => 'João Silva Atualizado',
              'bio'     => 'Estudante de TI no IFCE Campus Tianguá.',
          ]);

        $this->assertDatabaseHas('users', [
            'id'   => $this->user->id,
            'name' => 'João Silva Atualizado',
            'bio'  => 'Estudante de TI no IFCE Campus Tianguá.',
        ]);
    }

    public function test_user_can_update_name_only(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}", [
            'name' => 'Novo Nome Aqui',
            'bio'  => null,
        ])->assertOk();

        $this->assertDatabaseHas('users', ['id' => $this->user->id, 'name' => 'Novo Nome Aqui']);
    }

    public function test_update_name_fails_when_empty(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}", [
            'name' => '',
            'bio'  => 'Bio válida aqui.',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('name');
    }

    public function test_update_bio_fails_when_too_long(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}", [
            'name' => 'Nome válido aqui',
            'bio'  => str_repeat('a', 301),
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('bio');
    }

    public function test_guest_cannot_update_profile_data(): void
    {
        $this->putJson("/perfil/{$this->user->username}", [
            'name' => 'Tentativa visitante',
        ])->assertUnauthorized();
    }

    public function test_other_user_cannot_update_profile_data(): void
    {
        $this->actingAs($this->other);

        $this->putJson("/perfil/{$this->user->username}", [
            'name' => 'Tentativa outro usuário',
        ])->assertForbidden();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Avatar
    // ══════════════════════════════════════════════════════════════════════════

    public function test_user_can_update_avatar_url(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/avatar", [
            'avatar' => 'https://exemplo.com/foto.jpg',
        ])->assertOk()
          ->assertJson(['avatar' => 'https://exemplo.com/foto.jpg']);

        $this->assertDatabaseHas('users', [
            'id'     => $this->user->id,
            'avatar' => 'https://exemplo.com/foto.jpg',
        ]);
    }

    public function test_user_can_remove_avatar(): void
    {
        $this->user->update(['avatar' => 'https://exemplo.com/foto.jpg']);
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/avatar", [
            'avatar' => null,
        ])->assertOk()
          ->assertJson(['avatar' => null]);

        $this->assertDatabaseHas('users', ['id' => $this->user->id, 'avatar' => null]);
    }

    public function test_avatar_update_fails_with_invalid_url(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/avatar", [
            'avatar' => 'nao-e-uma-url-valida',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('avatar');
    }

    public function test_guest_cannot_update_avatar(): void
    {
        $this->putJson("/perfil/{$this->user->username}/avatar", [
            'avatar' => 'https://exemplo.com/foto.jpg',
        ])->assertUnauthorized();
    }

    public function test_other_user_cannot_update_avatar(): void
    {
        $this->actingAs($this->other);

        $this->putJson("/perfil/{$this->user->username}/avatar", [
            'avatar' => 'https://exemplo.com/foto.jpg',
        ])->assertForbidden();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Alteração de senha
    // ══════════════════════════════════════════════════════════════════════════

    public function test_user_can_change_password_with_correct_current_password(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => 'SenhaAtual123',
            'password'              => 'NovaSenha456',
            'password_confirmation' => 'NovaSenha456',
        ])->assertOk()
          ->assertJsonFragment(['message' => 'Senha alterada com sucesso!']);

        $this->user->refresh();
        $this->assertTrue(Hash::check('NovaSenha456', $this->user->password));
    }

    public function test_password_change_fails_with_wrong_current_password(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => 'SenhaErrada999',
            'password'              => 'NovaSenha456',
            'password_confirmation' => 'NovaSenha456',
        ])->assertUnprocessable();

        // Senha não deve ter mudado
        $this->user->refresh();
        $this->assertTrue(Hash::check('SenhaAtual123', $this->user->password));
    }

    public function test_password_change_fails_when_confirmation_doesnt_match(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => 'SenhaAtual123',
            'password'              => 'NovaSenha456',
            'password_confirmation' => 'SenhasDiferentes789',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('password');
    }

    public function test_password_change_fails_with_short_password(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => 'SenhaAtual123',
            'password'              => '123',
            'password_confirmation' => '123',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('password');
    }

    public function test_password_change_fails_without_current_password(): void
    {
        $this->actingAs($this->user);

        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => '',
            'password'              => 'NovaSenha456',
            'password_confirmation' => 'NovaSenha456',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors('current_password');
    }

    public function test_guest_cannot_change_password(): void
    {
        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => 'SenhaAtual123',
            'password'              => 'NovaSenha456',
            'password_confirmation' => 'NovaSenha456',
        ])->assertUnauthorized();
    }

    public function test_other_user_cannot_change_password(): void
    {
        $this->actingAs($this->other);

        $this->putJson("/perfil/{$this->user->username}/senha", [
            'current_password'      => 'SenhaAtual123',
            'password'              => 'NovaSenha456',
            'password_confirmation' => 'NovaSenha456',
        ])->assertForbidden();
    }
}
