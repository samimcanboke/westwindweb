<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPlans;
use Illuminate\Http\JsonResponse;

class JobPlansController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['plans' => JobPlans::all()]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['plan' => JobPlans::find($id)]);
    }   



}
