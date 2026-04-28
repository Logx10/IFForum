<?php
// ============================================================
//  app/Http/Resources/PostResource.php
// ============================================================
namespace App\Http\Resources;
 
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
 
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
 
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'slug'           => $this->slug,
            'body'           => $this->body,
            'status'         => $this->status,
            'is_pinned'      => $this->is_pinned,
            'is_featured'    => $this->is_featured,
            'views_count'    => $this->views_count,
            'comments_count' => $this->comments_count,
            'likes_count'    => $this->likes_count,
            'last_activity_at' => $this->last_activity_at?->diffForHumans(),
            'created_at'     => $this->created_at->toDateTimeString(),
 
            // Relacionamentos (só carregados se já estiverem eager-loaded)
            'author'   => new UserResource($this->whenLoaded('author')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'tags'     => TagResource::collection($this->whenLoaded('tags')),
 
            // Estado do usuário autenticado em relação ao post
            'is_liked'    => $user ? $this->isLikedBy($user) : false,
            'is_followed' => $user ? $this->followers->contains($user->id) : false,
        ];
    }
}