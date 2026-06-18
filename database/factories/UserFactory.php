<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'              => $this->faker->name(),
            'username'          => $this->faker->unique()->userName(),
            'email'             => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => Hash::make('password'),
            'bio'               => $this->faker->sentence(),
            'role'              => 'user',
            'remember_token'    => Str::random(10),
        ];
    }
}