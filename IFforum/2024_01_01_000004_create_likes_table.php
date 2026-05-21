<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabela polimórfica: funciona para likes em posts E em comments.
     *
     * Uso:
     *   likeable_type = "App\Models\Post"    | likeable_id = 5
     *   likeable_type = "App\Models\Comment" | likeable_id = 12
     */
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('likeable'); // cria likeable_id + likeable_type
            $table->enum('type', ['like', 'dislike'])->default('like');
            $table->timestamp('created_at')->useCurrent();

            // Um usuário só pode dar 1 like por item
            $table->unique(['user_id', 'likeable_id', 'likeable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
