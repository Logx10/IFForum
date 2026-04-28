<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('body');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['draft', 'published', 'locked', 'archived'])->default('published');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0); // cache counter
            $table->unsignedBigInteger('likes_count')->default(0);    // cache counter
            $table->timestamp('last_activity_at')->nullable();        // atualizado a cada novo comentário
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status', 'is_pinned']);
            $table->index('last_activity_at');
            $table->fullText(['title', 'body']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
