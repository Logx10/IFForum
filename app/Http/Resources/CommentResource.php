<?php

// ============================================================
//  app/Http/Resources/CommentResource.php
// ============================================================

namespace App\Http\Resources;
 
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
 
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
 
        return [
            'id'          => $this->id,
            'body'        => $this->body,
            'likes_count' => $this->likes_count,
            'is_solution' => $this->is_solution,
            'is_hidden'   => $this->is_hidden,
            'created_at'  => $this->created_at->diffForHumans(),
            'updated_at'  => $this->updated_at->toDateTimeString(),
 
            'author'  => new UserResource($this->whenLoaded('author')),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
 
            'is_liked' => $user ? $this->isLikedBy($user) : false,
            'can_edit' => $user ? ($user->id === $this->user_id || $user->isModerator()) : false,
        ];
    }
}