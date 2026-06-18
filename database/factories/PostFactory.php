<?php

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
 
 
