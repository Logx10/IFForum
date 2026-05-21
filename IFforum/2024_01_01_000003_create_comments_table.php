<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->longText('body');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')   // para respostas aninhadas (nested replies)
                  ->nullable()
                  ->constrained('comments')
                  ->cascadeOnDelete();
            $table->unsignedBigInteger('likes_count')->default(0); // cache counter
            $table->boolean('is_solution')->default(false);        // resposta marcada como solução
            $table->boolean('is_hidden')->default(false);          // moderação
            $table->timestamps();
            $table->softDeletes();

            $table->index(['post_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
