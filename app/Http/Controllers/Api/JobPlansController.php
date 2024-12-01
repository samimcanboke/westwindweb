<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPlans;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobPlansController extends Controller
{
    public function index(): JsonResponse
    {
        dd(Request::all());
        return response()->json(['plans' => JobPlans::all()]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['plan' => JobPlans::find($id)]);
    }   

}
