<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPlans;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class JobPlansController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = JWTAuth::user();
        return response()->json(['plans' => JobPlans::where('user_id', $user->id)->get()]);
    }

    public function show(int $id): JsonResponse
    {
        $user = JWTAuth::user();
        $plan = JobPlans::where('user_id', $user->id)->find($id);   
        if (!$plan) {
            return response()->json(['error' => 'Plan not found'], 404);
        }
        return response()->json($plan);
    }   

}
