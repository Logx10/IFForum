<?php
 
namespace App\Http\Resources;
 
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
 
class PostCollection extends ResourceCollection
{
    public $collects = PostResource::class;
 
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'filters_applied' => array_filter([
                    'category' => $request->category,
                    'tag'      => $request->tag,
                    'search'   => $request->search,
                ]),
            ],
        ];
    }
}