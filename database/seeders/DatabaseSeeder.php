<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Usuários fixos ─────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@forum.dev'],
            [
                'name'     => 'Admin',
                'username' => 'admin',
                'password' => 'password',
                'role'     => 'admin',
            ]
        );

        $mod = User::firstOrCreate(
            ['email' => 'ana@forum.dev'],
            [
                'name'     => 'Moderadora Ana',
                'username' => 'ana_mod',
                'password' => 'password',
                'role'     => 'moderator',
            ]
        );

        // ── 2. Usuários aleatórios ────────────────────────────────
        $users = User::factory(20)->create();

        // ── 3. Categorias ─────────────────────────────────────────
        $cats = collect([
            ['name' => 'Geral',         'icon' => '💬', 'color' => '#6366f1'],
            ['name' => 'Tecnologia',    'icon' => '💻', 'color' => '#0ea5e9'],
            ['name' => 'Programação',   'icon' => '🧑‍💻', 'color' => '#10b981'],
            ['name' => 'Dúvidas',       'icon' => '❓', 'color' => '#f59e0b'],
            ['name' => 'Apresentações', 'icon' => '👋', 'color' => '#ec4899'],
        ])->map(fn($c) => Category::firstOrCreate(
            ['slug' => Str::slug($c['name'])],
            [...$c, 'slug' => Str::slug($c['name'])]
        ));

        // Subcategoria
        Category::firstOrCreate(
            ['slug' => 'laravel'],
            [
                'name'      => 'Laravel',
                'slug'      => 'laravel',
                'icon'      => '🔴',
                'color'     => '#ef4444',
                'parent_id' => $cats->firstWhere('name', 'Programação')->id,
            ]
        );

        // ── 4. Tags ───────────────────────────────────────────────
        $tags = collect(['laravel', 'react', 'mysql', 'php', 'javascript', 'ajuda', 'tutorial'])
            ->map(fn($t) => Tag::firstOrCreate(['slug' => $t], ['name' => $t, 'slug' => $t]));

        // ── 5. Posts ──────────────────────────────────────────────
        $allUsers = $users->merge([$admin, $mod]);

        for ($i = 0; $i < 30; $i++) {
            $title = fake()->sentence(rand(5, 10));
            $post  = Post::create([
                'title'            => $title,
                'slug'             => Str::slug($title) . '-' . Str::random(5),
                'body'             => fake()->paragraphs(rand(3, 6), true),
                'user_id'          => $allUsers->random()->id,
                'category_id'      => $cats->random()->id,
                'status'           => 'published',
                'last_activity_at' => fake()->dateTimeBetween('-6 months', 'now'),
                'views_count'      => rand(0, 500),
            ]);

            $post->tags()->attach($tags->random(rand(1, 3))->pluck('id'));
        }

        // ── 6. Comentários ────────────────────────────────────────
        Post::all()->each(function ($post) use ($allUsers) {
            $comments = collect();

            for ($i = 0; $i < rand(2, 8); $i++) {
                $comments->push(Comment::create([
                    'body'    => fake()->paragraph(rand(1, 4)),
                    'post_id' => $post->id,
                    'user_id' => $allUsers->random()->id,
                ]));
            }

            $comments->take(2)->each(function ($parent) use ($post, $allUsers) {
                for ($i = 0; $i < rand(1, 3); $i++) {
                    Comment::create([
                        'body'      => fake()->paragraph(rand(1, 3)),
                        'post_id'   => $post->id,
                        'user_id'   => $allUsers->random()->id,
                        'parent_id' => $parent->id,
                    ]);
                }
            });

            $post->update(['comments_count' => $post->comments()->count()]);
        });

        $this->command->info('✅ Seeder concluído!');
        $this->command->info('👤 Admin: admin@forum.dev / password');
        $this->command->info('👤 Mod:   ana@forum.dev / password');
    }
}


// ============================================================
//  database/factories/PostFactory.php
// ============================================================
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(rand(5, 10));
        return [
            'title'            => $title,
            'slug'             => Str::slug($title) . '-' . Str::random(5),
            'body'             => $this->faker->paragraphs(rand(3, 6), true),
            'status'           => 'published',
            'last_activity_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'views_count'      => rand(0, 500),
        ];
    }
}


// ============================================================
//  database/factories/CommentFactory.php
// ============================================================
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'body' => $this->faker->paragraph(rand(1, 4)),
        ];
    }
}
