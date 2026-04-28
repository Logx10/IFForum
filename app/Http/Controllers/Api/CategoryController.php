<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $cats = Category::withCount('posts')
            ->with('children')
            ->whereNull('parent_id')
            ->where('is_active', '=', true)
            ->orderBy('order')
            ->get();

        return CategoryResource::collection($cats);
    }

    public function show(string $slug)
    {
        $cat = Category::where('slug', '=', $slug)
            ->withCount('posts')
            ->firstOrFail();

        return new CategoryResource($cat);
    }
}
